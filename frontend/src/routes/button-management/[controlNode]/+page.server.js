
// Define default Load function
export async function load({ params }) {

    // Expecting params.controlNode to exist

    // Build the API request URL using the contorlNode to get all associated buttons
    const res = await fetch('http://localhost:8080/api/v1/controlNodes/manageNode/' + params.controlNode, {
        method: 'GET',
    })

    // Load the audio options to pass to rendered button objects
    const audioOptionsRes = await fetch('http://localhost:8080/api/v1/audio', {
        method: 'GET',
    })


    console.log(params)

    const data = await res.json()
    const audioOptions = await audioOptionsRes.json()

    // console.log("API Return data:")
    // console.log(data)
    // console.log("Audio Options:")
    // console.log(audioOptions)

    return {
        "controlNode": data.data.controlNode,
        "buttons": data.data.buttons,
        "message": data.message,
        "audioOptions": audioOptions.data.audioClips
        // ...data
    }
}


export const actions = {
    update: async ({ request }) => {
        console.log("Update Button Request:")
        // Await for the form data from the request
        const buttonUpdateData = await request.formData();
        console.log(buttonUpdateData)

        // Get the ID from the URL parameter
        // const buttonId = params.id;

        // Get the id field from the buttonUpdateData
        const buttonId = buttonUpdateData.get('id')
        // Delete the buttonId field from the buttonUpdateData
        buttonUpdateData.delete('id')


        let putData = {
            "name": buttonUpdateData.get('name'),
            "description": buttonUpdateData.get('description'),
            "icon": buttonUpdateData.get('icon'),
            "audio": buttonUpdateData.get('audio'),


        }

        console.log("PUT Data:")
        console.log(putData)

        // Make a PUT request to the API
        const res = await fetch(`http://localhost:8080/api/v1/buttons/${buttonId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(putData),
        })

        // Handle the response

    },
}