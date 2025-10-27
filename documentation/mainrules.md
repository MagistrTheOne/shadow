Code generation rules

No mock or pseudo-code.
Agents must never create mock, stub, fake, todo, placeholder, example, simulate, sample, or demo code. Only working, real implementations are allowed. If context or data is missing, the agent must ask for clarification instead of fabricating content.

No speculative or simulated logic.
Agents must not guess or invent system behavior. Use only what is explicitly defined in arch.md, doc.md, or QA.md. Any “simulation”, “emulation”, or “prototype” is forbidden unless the task clearly asks for it.

No TODOs or unfinished sections.
Every output must be complete and functional. No “TODO”, “FIXME”, or half-finished code.

Real integration only.
When referencing APIs or components, use the real endpoints and configurations described in documentation. If unavailable, insert a <!-- require context --> comment instead of creating a fake block.

Testing discipline.
Tests must rely on real functions or modules. Mocks are forbidden unless explicitly required. Any use of jest.fn() or vi.mock() without a real import path counts as a failure.

Quality trigger.
Presence of mock, todo, fake, or simulate terms automatically invalidates generation. Real imports and executable interfaces are required for approval.
## КРИТИЧЕСКИЕ ПРАВИЛА - НИКОГДА НЕ НАРУШАТЬ

### ❌ ЗАПРЕЩЕНО:
1. **ПСЕВДОСИМУЛЯЦИЯ** - НЕ создавать fake данные, моки, симуляции
2. **TODO-ФЕЙКИ** - НЕ создавать фиктивные задачи или планы
3. **МОК-ДАННЫЕ** - НЕ генерировать поддельные API ответы, пользователей, контент
4. **СИМУЛЯЦИЯ РАБОТЫ** - НЕ имитировать выполнение задач без реальной реализации
5. **ФЕЙК-ИНТЕГРАЦИИ** - НЕ создавать ложные интеграции с внешними сервисами
6. **ПОДДЕЛЬНЫЕ РЕЗУЛЬТАТЫ** - НЕ генерировать fake результаты тестов, анализов
7. **МОК-КОМПОНЕНТЫ** - НЕ создавать компоненты с заглушками вместо реальной функциональности

### ✅ ОБЯЗАТЕЛЬНО:
1. **РЕАЛЬНЫЙ КОД** - Только работающий, функциональный код
2. **НАСТОЯЩИЕ API** - Использовать реальные API и сервисы
3. **ПРАВИЛЬНЫЕ ТИПЫ** - Строгая типизация TypeScript
4. **РЕАЛЬНЫЕ ДАННЫЕ** - Только валидные, корректные данные
5. **РАБОТАЮЩИЕ ИНТЕГРАЦИИ** - Полнофункциональные интеграции
6. **ТЕСТИРУЕМЫЙ КОД** - Код, который можно реально протестировать
7. **ПРОИЗВОДСТВЕННЫЙ КОД** - Код готовый к продакшену

### 🔍 ПРОВЕРКИ:
- Все API вызовы должны быть реальными
- Все данные должны быть валидными
- Все компоненты должны быть функциональными
- Все интеграции должны работать
- Весь код должен компилироваться без ошибок
- Все типы должны быть корректными
## ДОПОЛНИТЕЛЬНЫЕ ОГРАНИЧЕНИЯ

### 🚨 НЕ ДЕЛАТЬ:
- `// TODO: implement later` - реализовывать сразу
- `// Mock data` - использовать реальные данные
- `// Placeholder` - создавать полнофункциональные компоненты
- `// Simulate` - делать реальную работу
- `// Fake` - использовать настоящие данные
- `console.log("Simulated")` - писать реальную логику

### ✅ ДЕЛАТЬ:
- Полнофункциональные компоненты
- Реальные API интеграции
- Рабочий код с первого раза
- Правильную обработку ошибок
- Валидацию данных
- Тестируемую функциональность
// ❌ НЕПРАВИЛЬНО - псевдосимуляция
const mockData = { users: [{ id: 1, name: "John" }] };
console.log("Simulating API call...");

// ✅ ПРАВИЛЬНО - реальная реализация
const fetchUsers = async () => {
  const response = await fetch('/api/users');
  return response.json();
};
Используй web MCP чтобы:
1. Найти актуальную документацию по Next.js 16
2. Проверить breaking changes в Tauri 2.0
3. Найти примеры использования shadcn/ui
4. Изучить best practices для React 19
