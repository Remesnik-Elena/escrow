# 🏗 Scaffold-ETH 2

<h4 align="center">
  <a href="https://docs.scaffoldeth.io">Documentation</a> |
  <a href="https://scaffoldeth.io">Website</a>
</h4>

🧪 Этот смарт-контракт реализует продвинутую систему условного депонирования (escrow) для безопасных P2P-транзакций на блокчейне Ethereum. Он предназначен для обеспечения доверия между покупателем и продавцом без необходимости третьих сторон, таких как банки или платежные системы. Контракт поддерживает полный жизненный цикл сделки: от создания и финансирования до доставки, подтверждения, разрешения споров и вывода средств. Включает роли арбитра для разрешения конфликтов, комиссии платформы и арбитра, а также механизмы отмены и возврата средств. Идеально подходит для онлайн-продаж товаров, услуг или цифровых активов, где важно минимизировать риски мошенничества.

⚙️ Контракт написан на Solidity с использованием Hardhat.

Ключевые особенности:

Статусы сделок: Отслеживание этапов (создано, профинансировано, доставлено, завершено, оспорено, возвращено, отменено).
Арбитраж: Независимый арбитр разрешает споры, получая комиссию.
Комиссии: Платформа берет процент от успешных сделок, арбитр — фиксированную плату.
Безопасность и прозрачность: Все действия логируются через события, средства блокируются до разрешения.
Управление: Владелец может обновлять комиссию платформы.
Вывод средств: Пользователи могут выводить средства безопасно.

Функции

Создание эскроу: Покупатель создает сделку, указывая продавца, арбитра, комиссию арбитра и описание, и сразу финансирует ее.
Подтверждение доставки: Продавец подтверждает отправку товара.
Подтверждение получения: Покупатель подтверждает получение, высвобождая средства (минус комиссии).
Инициирование спора: Покупатель или продавец может оспорить сделку.
Разрешение спора: Арбитр принимает решение в пользу одной из сторон, распределяя средства.
Отмена сделки: Возможна до доставки, по инициативе сторон.
Вывод средств: Пользователи выводят накопленные средства.
Просмотр данных: Получение деталей сделок, списка эскроу пользователя, статистики платформы.
Управление платформой: Владелец обновляет комиссию платформы.

## Requirements

Before you begin, you need to install the following tools:

- [Node (>= v20.18.3)](https://nodejs.org/en/download/)
- Yarn ([v1](https://classic.yarnpkg.com/en/docs/install/) or [v2+](https://yarnpkg.com/getting-started/install))
- [Git](https://git-scm.com/downloads)

## Quickstart



1. Клонируйте репозиторий


2. Run a local network in the first terminal:

```
yarn chain
```

This command starts a local Ethereum network that runs on your local machine and can be used for testing and development. Learn how to [customize your network configuration](https://docs.scaffoldeth.io/quick-start/environment#1-initialize-a-local-blockchain).

3. On a second terminal, deploy the test contract:

```
yarn deploy
```

This command deploys a test smart contract to the local network. You can find more information about how to customize your contract and deployment script in our [documentation](https://docs.scaffoldeth.io/quick-start/environment#2-deploy-your-smart-contract).

4. On a third terminal, start your NextJS app:

```
yarn start
```

Visit your app on: `http://localhost:3000`. You can interact with your smart contract using the `Debug Contracts` page. 

Использование

Создание эскроу

Вызовите createEscrow(address payable _seller, address payable _arbiter, uint256 _arbiterFee, string memory _description) с отправкой ETH. Возвращает ID эскроу.
Пример: Покупатель отправляет 1 ETH, указывает продавца, арбитра и описание.

Процесс сделки

Продавец: Вызывает confirmDelivery(uint256 _escrowId) после отправки товара.
Покупатель: Вызывает confirmReceipt(uint256 _escrowId) для высвобождения средств.
Если спор: Вызвать raiseDispute(uint256 _escrowId), затем арбитр — resolveDispute(uint256 _escrowId, bool _favorBuyer).
Отмена: cancelEscrow(uint256 _escrowId) до доставки.

Вывод средств

Вызовите withdraw() для получения накопленных средств.
Просмотр данных

getEscrow(uint256 _escrowId): Детали сделки.
getUserEscrows(address _user): Список ID эскроу пользователя.
getPendingWithdrawal(address _user): Сумма для вывода.
getPlatformStats(): Статистика платформы.
Управление (только владелец)
updatePlatformFee(uint256 _newFeePercent): Изменить комиссию платформы (макс. 5%).

Тестирование

yarn hardhat:test
