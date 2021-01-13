export const isSchemaCachingFaunaError = (e: any) => {
    const res = safeVerifyError(e, ['requestResult', 'responseContent', 'errors', 0, 'failures', 0])
    if (res && res.code === 'duplicate value') {
        return res.description
    }
}

const safeVerifyError = (error: any, keys: any[]): any | false => {
    if (keys.length > 0) {
        if (error && error[keys[0]]) {
            const newError = error[keys[0]]
            keys.shift()
            return safeVerifyError(newError, keys)
        } else {
            return false
        }
    }
    return error
}