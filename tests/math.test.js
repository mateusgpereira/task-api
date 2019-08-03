const {calculateTip, celsiusToFahrenheit, fahrenheitToCelsius, add} = require('../src/math')

test('Should calculate total with tip', () => {
    const total = calculateTip(10, .3)
    expect(total).toBe(13)
})

test('Should calculate tip with default', () => {
    const total = calculateTip(10)
    expect(total).toBe(12.5)
})

test('Should convert 32 F to 0 C', () => {
    const temp = fahrenheitToCelsius(32)
    expect(temp).toBe(0)
})

test('Should convert 0 C to 32 F', () => {
    let temp = celsiusToFahrenheit(0)
    expect(temp).toBe(32)
})

test('add async demo', (done) => {
    add(10,40).then((sum) => {
        expect(sum).toBe(50)
        done()
    })
})

test('Should add two numbers async/await', async() => {
    let sum = await add(10,20)
    expect(sum).toBe(30)
})