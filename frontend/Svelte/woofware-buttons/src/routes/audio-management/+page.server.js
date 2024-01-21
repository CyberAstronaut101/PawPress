// TODO default load function will be to load the audio options

export async function load({ params }) {
    const res = await fetch('http://localhost:8080/api/v1/audio', {
        method: 'GET',
    })

    const data = await res.json()

    // console.log(data);
    return {
        "audioClips": data.data.audioClips
    }
}



// Define form post action default handler
export const actions = {
    default: async ({ request }) => {

        // FIRST we need to upload the audio clip to create the audio DB entry


        console.log("Audio Management Server :: Default Action Request:")
        // Await for the form data from the request
        const buttonUpdateData = await request.formData();
        console.log(buttonUpdateData)

        // Get the ID from the URL parameter
        // const buttonId = params.id;

        // Get the id field from the buttonUpdateData
        const buttonId = buttonUpdateData.get('id')
        // Delete the buttonId field from the buttonUpdateData
        buttonUpdateData.delete('id')
    }
}