# 经典前端面试问题：闭包陷阱与数据覆盖

## 案例背景

在 Skill Launcher 项目中实现技能使用记录持久化时，遇到了一个典型的**数据丢失 bug**：每次刷新或重新打开 GUI 后，之前的使用记录都被清空了。

## 问题一：数据覆盖问题

### 现象

- 文件存储在 `C:\Users\admin\AppData\Local\com.skillLauncher.app\skill-usage.json`
- 当次使用中记录正常保存
- F5 刷新或重启 GUI 后，文件内容被清空

### 原因分析

#### 1. 直接覆盖写入

原始保存逻辑：

```typescript
setUsageData((currentData) => {
  const newData = { usage: newUsage };
  // 异步保存
  (async () => {
    await writeFile(filePath, encoder.encode(JSON.stringify(newData)));
  })();
  return newData;
});
```

**问题**：直接 `writeFile` 覆盖，没有考虑文件中已有的数据。

#### 2. 加载失败时的空数据覆盖

```typescript
async function loadUsageData() {
  try {
    const data = JSON.parse(jsonStr);
    setUsageData(data);
  } catch (err) {
    // 任何读取失败都会导致空数据
    setUsageData({ usage: [] });  // 危险！
  }
}
```

**时序问题**：
1. `loadUsageData` 读取失败（临时权限问题、文件被占用、JSON 解析错误等）
2. 内存状态被设为 `{ usage: [] }`
3. 用户点击 skill，触发 `recordUsage`
4. `recordUsage` 基于空数据计算 `newUsage`
5. `writeFile` 直接覆盖，文件中的有效数据丢失

### 解决方案

#### 合并写入模式

```typescript
// 保存前先读取现有文件，合并后再写入
try {
  const { readFile } = await import("@tauri-apps/plugin-fs");
  const existingContents = await readFile(filePath);
  const existingData = JSON.parse(decoder.decode(existingContents));

  if (existingData?.usage?.length > 0) {
    // 使用 Map 合并数据（新记录覆盖旧的同名记录）
    const mergedMap = new Map<string, SkillUsageRecord>();

    // 先添加现有记录
    existingData.usage.forEach(record => {
      if (record?.name) {
        mergedMap.set(record.name, record);
      }
    });

    // 再添加新记录（自动覆盖同名的）
    newUsage.forEach(record => {
      if (record?.name) {
        mergedMap.set(record.name, record);
      }
    });

    const mergedData = { usage: Array.from(mergedMap.values()) };
    await writeFile(filePath, encoder.encode(JSON.stringify(mergedData, null, 2)));
    console.log("合并模式保存成功");
    return;  // 合并成功，直接返回
  }
} catch (readErr) {
  // 文件不存在或读取失败，创建新文件
}

// 正常保存新文件
await writeFile(filePath, encoder.encode(jsonStr));
```

**核心思想**：永远先读后写，合并而非覆盖。

---

## 问题二：React Hooks 闭包陷阱

### 现象

```typescript
const [loadCompleted, setLoadCompleted] = useState(false);

const recordUsage = useCallback(async (skillName: string) => {
  // 检查加载状态
  if (!loadCompleted) {
    console.log("等待加载完成...");
    // 等待逻辑
  }
  // ...
}, []);  // 空依赖数组！
```

**结果**：`loadCompleted` 永远是 `false`，等待逻辑永远不会生效。

### 原因分析

#### 闭包形成机制

`useCallback` 的依赖数组为空时，回调函数只在组件挂载时创建一次：

```typescript
// 组件挂载时，loadCompleted = false
const recordUsage = useCallback(() => {
  console.log(loadCompleted);  // 闭包捕获了 false
}, []);  // 空依赖，永不更新

// 即使后来 setLoadCompleted(true)
// recordUsage 内部的 loadCompleted 仍然是 false
```

#### 为什么会这样？

JavaScript 闭包捕获的是**变量值**而非**变量引用**：

```typescript
let value = false;
const fn = () => console.log(value);  // 闭包捕获 false
value = true;
fn();  // 输出 false，不是 true！
```

### 解决方案

#### 方案 1：使用 useRef（推荐）

```typescript
// useRef 返回的对象在整个组件生命周期内保持不变
const loadCompletedRef = useRef(false);

// 修改值通过 .current
loadCompletedRef.current = true;

// useCallback 内部访问 .current
const recordUsage = useCallback(async (skillName: string) => {
  if (!loadCompletedRef.current) {  // 总是获取最新值
    // 等待逻辑
  }
}, []);
```

**为什么有效**：
- `useRef` 返回的是一个可变对象 `{ current: ... }`
- 对象的引用在闭包中保持不变
- 通过 `.current` 访问的始终是最新值

#### 方案 2：添加依赖（会导致函数重建）

```typescript
const recordUsage = useCallback(async (skillName: string) => {
  if (!loadCompleted) {
    // ...
  }
}, [loadCompleted]);  // 添加依赖
```

**缺点**：`loadCompleted` 变化会导致函数重建，可能影响其他使用该函数的地方。

#### 方案 3：函数式更新（适用于 setState）

```typescript
setUsageData((currentData) => {
  // currentData 总是最新的，不需要在依赖数组中声明
  const newData = { ...currentData, ...updates };
  return newData;
});
```

---

## 面试要点总结

### 闭包陷阱

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| `useCallback` 中变量值过期 | 空依赖数组导致闭包捕获初始值 | 使用 `useRef` 或添加依赖 |
| `setInterval` 中 state 过期 | 定时器回调捕获初始 state | 使用 useRef 或函数式更新 |
| 事件监听器中 state 过期 | 监听器闭包捕获旧值 | 每次更新时移除+重新添加监听器 |

### 数据持久化最佳实践

1. **先读后写**：保存前读取现有数据，合并后再写入
2. **防御性检查**：验证数据格式，避免用空数据覆盖
3. **原子性操作**：考虑并发场景，使用合并策略
4. **错误恢复**：写入失败时保留原有数据

### React Hooks 记忆要点

```typescript
// useState - 闭包陷阱
const [state, setState] = useState(0);
useEffect(() => {
  const timer = setInterval(() => {
    console.log(state);  // 永远是初始值！
  }, 1000);
  return () => clearInterval(timer);
}, []);

// useRef - 解决方案
const stateRef = useRef(0);
useEffect(() => {
  const timer = setInterval(() => {
    console.log(stateRef.current);  // 最新值
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 相关代码位置

- Hook 文件：`src/hooks/useSkillUsage.ts`
- 权限配置：`src-tauri/capabilities/default.json`
- 类型定义：`src/types/skillUsage.ts`
