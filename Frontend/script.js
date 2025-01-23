document.addEventListener('DOMContentLoaded', () => {
    const lockStatus = document.getElementById('lockStatus');
    const openButton = document.getElementById('openButton');
    const closeButton = document.getElementById('closeButton');
    const contractStatus = document.getElementById('contractStatus');

    const ESP32_IP = "http://your-ip"; // Cambia esto por la IP de tu ESP32

    // Conexión con la red Ethereum (MetaMask)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum); // Cambia "ropsten" por la red que estás utilizando
        const signer = provider.getSigner();
        const contractAddress = "your-contract-direction";  // Reemplaza con la dirección de tu contrato desplegado
        const contractABI = [
            {
              "inputs": [],
              "name": "admin",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "",
                  "type": "address"
                }
              ],
              "stateMutability": "view",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "enum LockRegister.ActionType",
                  "name": "_action",
                  "type": "uint8"
                }
              ],
              "name": "registerAction",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [
                {
                  "internalType": "address",
                  "name": "newAdmin",
                  "type": "address"
                }
              ],
              "name": "changeAdmin",
              "outputs": [],
              "stateMutability": "nonpayable",
              "type": "function"
            },
            {
              "inputs": [],
              "name": "ActionRegistered",
              "outputs": [
                {
                  "internalType": "address",
                  "name": "user",
                  "type": "address"
                },
                {
                  "internalType": "enum LockRegister.ActionType",
                  "name": "action",
                  "type": "uint8"
                },
                {
                  "internalType": "uint256",
                  "name": "timestamp",
                  "type": "uint256"
                }
              ],
              "stateMutability": "event",
              "type": "event"
            }
          ];

        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // Función para enviar solicitudes al servidor de la ESP32
        const sendRequest = async (value) => {
            try {
                const response = await fetch(`${ESP32_IP}/data?value=${value}`);
                const result = await response.text();
                console.log(result);
                return result.includes("activado") ? "Abierto" : "Cerrado";
            } catch (error) {
                console.error("Error to connect ESP32:", error);
                return "Error";
            }
        };

        // Función para registrar la acción en el contrato
        const registerActionInContract = async (action) => {
            try {
                const actionType = action === "open" ? 0 : 1; // 0 = Open, 1 = Close
                const tx = await contract.registerAction(actionType);
                console.log("Transacción enviada:", tx);
                await tx.wait();
                contractStatus.textContent = "Acción registrada exitosamente en el contrato.";
                contractStatus.style.color = "green";
            } catch (error) {
                console.error("Error to register action:", error);
                contractStatus.textContent = "Error to register action.";
                contractStatus.style.color = "red";
            }
        };

        // Función para abrir el pestillo
        openButton.addEventListener('click', async () => {
            lockStatus.textContent = "Opening...";
            lockStatus.style.color = "orange";
            await registerActionInContract("open"); // Registrar acción "Abrir" en el contrato
            const status = await sendRequest(1);
            lockStatus.textContent = status;
            lockStatus.style.color = "green";
            
        });

        // Función para cerrar el pestillo
        closeButton.addEventListener('click', async () => {
            lockStatus.textContent = "Closing...";
            lockStatus.style.color = "orange";
            await registerActionInContract("close"); // Registrar acción "Cerrar" en el contrato
            const status = await sendRequest(0);
            lockStatus.textContent = status;
            lockStatus.style.color = "red";
            
        });

    } else {
        console.error("MetaMask no está instalado.");
        contractStatus.textContent = "MetaMask no está instalado.";
        contractStatus.style.color = "red";
    }
});
