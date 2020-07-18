export const authenticateCall = (request, response, next) => {
    const apiKey = request.params.apiKey

    if (apiKey === process.env.CALL_API_KEY) {
        next()
    } else {
        return response.status(401).send()
    }
}