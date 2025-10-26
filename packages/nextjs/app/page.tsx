"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  // Состояния формы создания эскроу
  const [sellerAddress, setSellerAddress] = useState("");
  const [arbiterAddress, setArbiterAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [arbiterFee, setArbiterFee] = useState("");
  const [description, setDescription] = useState("");

  // Состояния для отображения
  const [activeTab, setActiveTab] = useState<"create" | "my-escrows">("create");

  // Чтение данных контракта
  const { data: userEscrows } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getUserEscrows",
    args: [connectedAddress],
  });

  const { data: pendingWithdrawal } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPendingWithdrawal",
    args: [connectedAddress],
  });

  const { data: platformStats } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getPlatformStats",
  });

  // Функции записи в контракт
  const { writeContractAsync: createEscrow } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: confirmDelivery } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: confirmReceipt } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: raiseDispute } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: cancelEscrow } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: withdraw } = useScaffoldWriteContract("YourContract");

  // Обработчик создания эскроу
  const handleCreateEscrow = async () => {
    try {
      if (!sellerAddress || !arbiterAddress || !amount || !description) {
        notification.error("Заполните все поля");
        return;
      }

      await createEscrow({
        functionName: "createEscrow",
        args: [sellerAddress, arbiterAddress, parseEther(arbiterFee || "0"), description],
        value: parseEther(amount),
      });

      notification.success("Эскроу успешно создан!");

      // Очистка формы
      setSellerAddress("");
      setArbiterAddress("");
      setAmount("");
      setArbiterFee("");
      setDescription("");
      setActiveTab("my-escrows");
    } catch (error) {
      console.error("Error creating escrow:", error);
      notification.error("Ошибка при создании эскроу");
    }
  };

  // Обработчик подтверждения доставки
  const handleConfirmDelivery = async (escrowId: number) => {
    try {
      await confirmDelivery({
        functionName: "confirmDelivery",
        args: [BigInt(escrowId)],
      });
      notification.success("Доставка подтверждена!");
    } catch (error) {
      console.error("Error confirming delivery:", error);
      notification.error("Ошибка при подтверждении доставки");
    }
  };

  // Обработчик подтверждения получения
  const handleConfirmReceipt = async (escrowId: number) => {
    try {
      await confirmReceipt({
        functionName: "confirmReceipt",
        args: [BigInt(escrowId)],
      });
      notification.success("Получение подтверждено! Средства переведены продавцу.");
    } catch (error) {
      console.error("Error confirming receipt:", error);
      notification.error("Ошибка при подтверждении получения");
    }
  };

  // Обработчик открытия спора
  const handleRaiseDispute = async (escrowId: number) => {
    try {
      await raiseDispute({
        functionName: "raiseDispute",
        args: [BigInt(escrowId)],
      });
      notification.success("Спор открыт. Арбитр уведомлен.");
    } catch (error) {
      console.error("Error raising dispute:", error);
      notification.error("Ошибка при открытии спора");
    }
  };

  // Обработчик отмены эскроу
  const handleCancelEscrow = async (escrowId: number) => {
    try {
      await cancelEscrow({
        functionName: "cancelEscrow",
        args: [BigInt(escrowId)],
      });
      notification.success("Эскроу отменен. Средства возвращены.");
    } catch (error) {
      console.error("Error cancelling escrow:", error);
      notification.error("Ошибка при отмене эскроу");
    }
  };

  // Обработчик вывода средств
  const handleWithdraw = async () => {
    try {
      await withdraw({
        functionName: "withdraw",
      });
      notification.success("Средства успешно выведены!");
    } catch (error) {
      console.error("Error withdrawing:", error);
      notification.error("Ошибка при выводе средств");
    }
  };

  // Функция для получения статуса на русском
  const getStatusText = (status: number) => {
    const statuses = ["Создан", "Профинансирован", "Доставлено", "Завершен", "Оспаривается", "Возвращен", "Отменен"];
    return statuses[status] || "Неизвестно";
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: number) => {
    const colors = [
      "badge-info",
      "badge-warning",
      "badge-primary",
      "badge-success",
      "badge-error",
      "badge-ghost",
      "badge-ghost",
    ];
    return colors[status] || "badge-ghost";
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-7xl">
          <h1 className="text-center mb-8">
            <span className="block text-4xl font-bold mb-2">🔐 Escrow Platform</span>
            <span className="block text-xl text-base-content/70">Безопасные P2P транзакции</span>
          </h1>

          {/* Информация о подключении */}
          <div className="flex justify-center items-center space-x-2 mb-6">
            <div className="flex flex-col items-center">
              <p className="font-medium mb-2">Ваш адрес:</p>
              <Address address={connectedAddress} />
            </div>
          </div>

          {/* Статистика платформы */}
          {platformStats && (
            <div className="stats shadow w-full mb-6">
              <div className="stat">
                <div className="stat-title">Всего сделок</div>
                <div className="stat-value text-primary">{platformStats[0]?.toString()}</div>
              </div>
              <div className="stat">
                <div className="stat-title">Общий объем</div>
                <div className="stat-value text-secondary">
                  {parseFloat(formatEther(platformStats[1] || BigInt(0))).toFixed(4)} ETH
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Доступно к выводу</div>
                <div className="stat-value text-accent">
                  {parseFloat(formatEther(pendingWithdrawal || BigInt(0))).toFixed(4)} ETH
                </div>
                {pendingWithdrawal && pendingWithdrawal > 0n && (
                  <div className="stat-actions">
                    <button className="btn btn-sm btn-success" onClick={handleWithdraw}>
                      Вывести средства
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Табы */}
          <div className="tabs tabs-boxed mb-6 justify-center">
            <a
              className={`tab tab-lg ${activeTab === "create" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              Создать эскроу
            </a>
            <a
              className={`tab tab-lg ${activeTab === "my-escrows" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("my-escrows")}
            >
              Мои сделки ({userEscrows?.length || 0})
            </a>
          </div>

          {/* Контент вкладок */}
          <div className="w-full">
            {/* Создание эскроу */}
            {activeTab === "create" && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl mb-4">Создать новую сделку</h2>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Адрес продавца</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="input input-bordered w-full"
                      value={sellerAddress}
                      onChange={e => setSellerAddress(e.target.value)}
                    />
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Адрес арбитра</span>
                    </label>
                    <input
                      type="text"
                      placeholder="0x..."
                      className="input input-bordered w-full"
                      value={arbiterAddress}
                      onChange={e => setArbiterAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Сумма (ETH)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="0.1"
                        className="input input-bordered w-full"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                      />
                    </div>

                    <div className="form-control w-full">
                      <label className="label">
                        <span className="label-text">Комиссия арбитра (ETH)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="0.01"
                        className="input input-bordered w-full"
                        value={arbiterFee}
                        onChange={e => setArbiterFee(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text">Описание сделки</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      placeholder="Опишите товар или услугу..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-lg" onClick={handleCreateEscrow}>
                      Создать эскроу
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Список сделок */}
            {activeTab === "my-escrows" && (
              <div className="space-y-4">
                {userEscrows && userEscrows.length > 0 ? (
                  userEscrows.map((escrowId: bigint) => (
                    <EscrowCard
                      key={escrowId.toString()}
                      escrowId={Number(escrowId)}
                      connectedAddress={connectedAddress}
                      onConfirmDelivery={handleConfirmDelivery}
                      onConfirmReceipt={handleConfirmReceipt}
                      onRaiseDispute={handleRaiseDispute}
                      onCancelEscrow={handleCancelEscrow}
                      getStatusText={getStatusText}
                      getStatusColor={getStatusColor}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <p className="text-xl text-base-content/70">У вас пока нет сделок</p>
                    <button className="btn btn-primary mt-4" onClick={() => setActiveTab("create")}>
                      Создать первую сделку
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Компонент карточки эскроу
const EscrowCard = ({
  escrowId,
  connectedAddress,
  onConfirmDelivery,
  onConfirmReceipt,
  onRaiseDispute,
  onCancelEscrow,
  getStatusText,
  getStatusColor,
}: {
  escrowId: number;
  connectedAddress: string | undefined;
  onConfirmDelivery: (id: number) => void;
  onConfirmReceipt: (id: number) => void;
  onRaiseDispute: (id: number) => void;
  onCancelEscrow: (id: number) => void;
  getStatusText: (status: number) => string;
  getStatusColor: (status: number) => string;
}) => {
  const { data: escrow } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getEscrow",
    args: [BigInt(escrowId)],
  });

  if (!escrow) return null;

  const isBuyer = connectedAddress?.toLowerCase() === escrow.buyer?.toLowerCase();
  const isSeller = connectedAddress?.toLowerCase() === escrow.seller?.toLowerCase();
  const status = Number(escrow.status);

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="card-title">
              Эскроу #{escrowId}
              <div className={`badge ${getStatusColor(status)}`}>{getStatusText(status)}</div>
            </h3>
            <p className="text-sm text-base-content/70 mt-2">{escrow.description}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{formatEther(escrow.amount)} ETH</p>
            <p className="text-xs text-base-content/60">Комиссия арбитра: {formatEther(escrow.arbiterFee)} ETH</p>
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Покупатель:</p>
            <Address address={escrow.buyer} />
          </div>
          <div>
            <p className="font-semibold">Продавец:</p>
            <Address address={escrow.seller} />
          </div>
        </div>

        <div className="card-actions justify-end mt-4">
          {/* Кнопки для продавца */}
          {isSeller && status === 1 && (
            <button className="btn btn-primary btn-sm" onClick={() => onConfirmDelivery(escrowId)}>
              Подтвердить отправку
            </button>
          )}

          {/* Кнопки для покупателя */}
          {isBuyer && status === 2 && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => onConfirmReceipt(escrowId)}>
                Подтвердить получение
              </button>
              <button className="btn btn-error btn-sm" onClick={() => onRaiseDispute(escrowId)}>
                Открыть спор
              </button>
            </>
          )}

          {/* Отмена сделки */}
          {(isBuyer || isSeller) && status === 1 && (
            <button className="btn btn-warning btn-sm" onClick={() => onCancelEscrow(escrowId)}>
              Отменить сделку
            </button>
          )}

          {/* Открытие спора - только на стадиях FUNDED или DELIVERED */}
          {(isBuyer || isSeller) && (status === 1 || status === 2) && (
            <button className="btn btn-outline btn-sm" onClick={() => onRaiseDispute(escrowId)}>
              Спор
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
