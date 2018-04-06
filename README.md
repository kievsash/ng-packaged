# Masked ngx--phone-input component

##### What I did

I just cloned ng-packager empty example and added my masked-phone-input component to the lib section

So you can start sample app with **>ng serve** command and see this component

All the components code is located in ./my-lib/src dir

##### Which phone number formats
Actually input is not configurable at the moment
Mask for now is 1(999)999-9999 or (999)999-9999 - for American phone format.
Feel free to fork it and make it better since I don't have enough time to finish it.

##### Demo1

<img src="https://media.giphy.com/media/ujvVR2zeStL8zaytmT/giphy.gif">

##### Demo1

<img src="https://media.giphy.com/media/8PBfNU1L9QarpbZ23n/giphy.gif">

##### How to use input

Just check example in app component.

##### To build lib
 
You have to just run npm run build:lib

./dist folder will be created.

So just do
>cd ./dist/my-lib \
 npm publish

Change the version in  package.json in this folder if you need it.


###### *I will keep original ng-packager readme content if case you need it


## Packaging Angular libraries with ng-packagr

> Angular libraries are fun!

This repository is an example how to set-up an Angular library project.

It features the `@my/lib` library package: `@my/lib` is packaged with [ng-packagr](https://github.com/dherges/ng-packagr) and then imported into an Angular CLI app.
To run the example, do the following steps:

```bash
$ yarn install
$ yarn build:lib
$ ng serve
```

Here are instructions how this demo was created.


#### Install

Set up an Angular CLI project, add `ng-packagr`:

```bash
$ ng new ng-packaged
$ yarn add --dev ng-packagr
```


#### Create Library

Create a library in `my-lib`.
It's recommended to provide a single `public_api.ts` as the entry point to your library.


#### Add Build Script and Configuration

In root `package.json`:

```json
{
  "name": "ng-packaged",
  "scripts": {
    "build:lib": "ng-packagr"
  }
}
```

It picks up a configuration in `ng-package.json`:

```json
{
  "$schema": "./node_modules/ng-packagr/ng-package.schema.json",
  "src": "my-lib",
  "dest": "dist/my-lib",
  "workingDirectory": ".ng_build",
  "lib": {
    "entryFile": "my-lib/src/public_api.ts"
  }
}
```

ng-packagr comes with built-in support for [autoprefixer](https://github.com/postcss/autoprefixer) and [postcss](https://github.com/postcss/postcss).
It uses [browserslist](https://github.com/ai/browserslist) to determine which browser versions should be supported.
Create the file `my-lib/.browserslistrc`:

```
last 2 Chrome versions
iOS > 10
Safari > 10
```


#### Build

Now, build your library:

```bash
$ yarn build:lib
```


#### Show off in Demo App

First, in `.angular-cli.json` set `outDir` of the Angular CLI app, so that it does not conflict with output directory of your library!

```json
{
  "project": {
    "name": "ng-packaged"
  },
  "apps": [
    {
      "root": "src",
      "outDir": "dist/app",
      /* ... */
    }
  ]
}
```


Then, in `tsconfig.app.json`, map the TypeScript import path:

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "paths": {
      "@my/lib": [ "../dist/my-lib" ]
    }
  }
}
```

Finally, include in your application.
In `app.module.ts`:

```ts
import { MyLibModule } from '@my/lib';

@NgModule({
  imports: [
    /* .. */
    MyLibModule.forRoot()
  ],
})
export class AppModule { }
```

And use them in components like `app.component.ts`:

```ts
import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BarService } from '@my/lib';

@Component({
  selector: 'app-root',
  template: `
<my-foo></my-foo>
<hr>
<marquee>{{ value$ | async }}</marquee>
`,
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  value$: Observable<string>;

  constructor (
    bar: BarService
  ) {
     this.value$ = bar.value;
  }

}
```
