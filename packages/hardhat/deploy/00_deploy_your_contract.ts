import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Развертывает контракт "YourContract" (Escrow) используя аккаунт deployer
 * и аргументы конструктора установленные на адрес deployer
 *
 * @param hre HardhatRuntimeEnvironment объект
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    На localhost, аккаунт deployer - это один из аккаунтов Hardhat, который уже имеет средства.
    
    При развертывании в живые сети (например, yarn deploy --network sepolia), 
    аккаунт deployer должен иметь достаточный баланс для оплаты газа за создание контракта.
    
    Вы можете сгенерировать случайный аккаунт с помощью yarn generate 
    или импортировать существующий приватный ключ yarn account:import, 
    который заполнит DEPLOYER_PRIVATE_KEY_ENCRYPTED в файле .env 
    (затем используется в hardhat.config.ts)
    
    Вы можете выполнить команду yarn account для проверки баланса в каждой сети.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n📡 Развертывание Escrow контракта...");
  console.log("👤 Deployer address:", deployer);

  // Проверяем баланс deployer
  const balance = await hre.ethers.provider.getBalance(deployer);
  console.log("💰 Deployer balance:", hre.ethers.formatEther(balance), "ETH");

  await deploy("YourContract", {
    from: deployer,
    // Аргументы конструктора контракта
    args: [deployer],
    log: true,
    autoMine: true,
  });

  // Получаем развернутый контракт для взаимодействия с ним после развертывания
  const yourContract = await hre.ethers.getContract<Contract>("YourContract", deployer);
  console.log("✅ Escrow контракт развернут по адресу:", await yourContract.getAddress());

  // Получаем начальную статистику
  try {
    const stats = await yourContract.getPlatformStats();
    console.log("\n📊 Статистика платформы:");
    console.log("   Всего эскроу:", stats[0].toString());
    console.log("   Общий объем:", hre.ethers.formatEther(stats[1]), "ETH");
    console.log("   Комиссия платформы:", stats[2].toString(), "%");
  } catch (error) {
    console.log("⚠️  Не удалось получить статистику:", error);
  }

  // Получаем владельца контракта
  try {
    const owner = await yourContract.owner();
    console.log("\n👑 Владелец контракта:", owner);
  } catch (error) {
    console.log("⚠️  Не удалось получить владельца:", error);
  }

  console.log("\n🎉 Развертывание завершено успешно!");
  console.log("🔗 Вы можете взаимодействовать с контрактом через UI");
};

export default deployYourContract;

deployYourContract.tags = ["YourContract"];
