export interface N8nResponse {
    success: boolean;
    message?: string;
    data?: any;
  }

const n8nUrl = 'http://localhost:5678/webhook/2aaee169-6f97-4d7d-a49b-7ce59f7f8f29'

export const getN8nData = async(message: string) => {
    const response = await fetch(n8nUrl,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                
            },

            body: JSON.stringify({
                message: message
            })
        }
    )
    const data = await response.json()
    return data.output

}
