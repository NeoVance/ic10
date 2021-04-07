# ic10

ic10 interpiter

```typescript
var code = "some ic10 script"
var settings = {
	debug: true,
	debugCallback: () => {
		console.log(...arguments)
	},
	logCallback: () => {
		console.log(...arguments)
	},
	executionCallback: (e: ic10Error) => {
	},
}
var interpreterIc10 = new InterpreterIc10(code, settings)
// OR
interpreterIc10.init(code)

interpreterIc10.run()

```
