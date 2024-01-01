//  const SUCCESS = 'success';
function getSuccessMessage(summary, detail) {
    return {
        severity: 'success',
        summary: summary,
        detail: detail,
    }
}
function getInfoMessage(summary, detail) {
    return {
        severity: 'info',
        summary: summary,
        detail: detail,
    }
}
function getWarnMessage(summary, detail) {
    return {
        severity: 'warn',
        summary: summary,
        detail: detail,
    }
}

function getErrorMessage(summary, detail) {
    return {
        severity: 'error',
        summary: summary,
        detail: detail,
    }
}
// constructor(statusCode, severity, message, detail) {
//     return {
//         severity: severity,
//         message: message,
//         detail: detail
//     }
// }

module.exports = {
    getErrorMessage,
    getSuccessMessage,
    getWarnMessage,
    getInfoMessage,
}
