Clean DI is a type-safe, lightweight and easy to use dependency injection container.
It comes in sync and async flavours and allows you to create dependency providers from class constructors, functions and plain values.

The main selling points of this library are:
 - type safety if you use it with typescript, meaning you won't get unexpected type errors at runtime
 - clean in the sense you don't 'taint' your code and third party code with decorators, imports or bloated unnatural stuff
 - backwards compatible with old browsers or nodejs versions because it uses ES5 and nothing else
 - zero dependencies project when you use npm install cleandi
 - fluent API with intellisense, very easy to leverage
 - testable, because calling build() checks your dependency tree without side effects
 - very small in bundle size and very fast in execution
 - can work in async fashion too
 - you can also use it vanilla js (no types), although you won't get the full features

```
// sync provider example
import {builder} from 'cleandi';

const provider = builder<Provider>
    .bindConstructor('car', Mercedes, d => [d.wheels, d.pilot] as const)
    .bindFunction('pilot', getPilot)
    .bindValue('wheels', 4)
    .build('car', 'pilot', 'wheels');
    
console.log(provider.car.drive()); 

interface Car {
    drive();
}

class Mercedes implements Car {
    constructor(private wheels: number, private pilot: string) {}
    drive() {
        return `Here it goes the Mercedes with ${this.wheels} wheels, driven by ${this.pilot}`;
    }
}

function getPilot() {
    return 'John Smith';
}

interface Provider {
    car: Car,
    pilot: name,
    wheels: number
}

```

You start by calling `builder<T>()` where `T` is the object you want to create. The magic resides here because all the API is aware of `T` and it won't let you do wrong things. Then, you get a builder object where you can chain `bind` methods.
There are bindings for class constructors, functions and values. On each of them, you have to specify a field of `T`, and provide the constructor, function or value for that. For constructors and functions you are required to specify the arguments too, but the beauty you can use other fields of `T` as args if you want.
Then, you call `build` specifying all the `T` fields to create the dependency provider. This step is a tradeoff necessary to check if the types where defined in runtime.
Finally, with the provider you can get instances previously defined just querying by it's name.

```
// async provider example
import {asyncBuilder, none} from 'cleandi';

const provider = asyncBuilder<Provider>
    .bindAsyncFunction('data', logInConsole, d => [] as const)
    .bindValue('logger', console.log)
    .build('data', 'logger');
    
await provider.logger
    
interface Provider {
    logger: (msg: string) => void;
    data: string;
}

async function getDataFromDb() {
    // some operations in a dbf
    await result;
}

```

There were more than 2000 dependency injection libraries and frameworks in npmjs before starting this project, so why make one more?  
This library is my own take on Dependency Injection after reviewing the state of the art and  tries to be as much typesafe as possible without lossing other important goals which are:
Original dependency code doesn't need a change
The dependencies are typesafe and scalable enough
The library relies on a small runtime check appart from types which ensures the dependencies are right. This was the better solution I have found to keep the library as typesafe, scalable and simple as possible.

