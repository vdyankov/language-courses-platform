const waitForResponse = (message: string, delay: number) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log(message);
            resolve(true);
        }, delay);
    })
}

(async () => {
    await waitForResponse('Test1', 2000);
    await waitForResponse('Test2', 1000);
    await waitForResponse('Test3', 3000);
})()