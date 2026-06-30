// Function to test VTpass Connection
async function testVTpassConnection() {
    const url = "https://sandbox.vtpass.com/api/balance"; // Using the balance endpoint to test authentication
    const apiKey = "YOUR_API_KEY_HERE"; // Replace with your Sandbox API Key
    const secretKey = "YOUR_SECRET_KEY_HERE"; // Replace with your Sandbox Secret Key

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'api-key': apiKey,
                'secret-key': secretKey,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log("Connection Success:", data);
    } catch (error) {
        console.error("Connection Failed:", error);
    }
  
}
