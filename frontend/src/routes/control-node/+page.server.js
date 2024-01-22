/*
    Control Node - Server Side - Page
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    - Loads the Control Nodes (adopted and not) from the database
*/

// Nothing to import right now

// Define default Load function
export async function load() {
    const res = await fetch('http://localhost:8080/api/v1/controlNodes', {
        method: 'GET',
    })

    const data = await res.json()

    // console.log(data)

    return {
        ...data
    }
}