# Node Express RESTful API Starter (TS)

## Introduction

## Getting Started

### 1. Download starter and install dependencies

Clone this repository:

```
git clone git@github.com:BCIT-DDC/node-ts-restful-api-starter.git
```

Install npm dependencies:

```
cd node-ts-restful-api-starter
npm install
```

### 2. Create and seed the database

Run the following command to create your SQLite database file. This also creates the `User` and `Post` tables that are defined in [`./src/prisma/schema.prisma`](./src/prisma/schema.prisma):

```
npm run prisma:migrate
```

Now, seed the database with the sample data in [`./src/prisma/db.seed.ts`](./src/prisma/db.seed.ts) by running the following command:

```
npm run prisma:seed
```

### 3. Start the REST API server

```
npm run dev
```

The server is now running on `http://localhost:3000`. You can now the API requests, e.g. [`http://localhost:3000/api/users`](http://localhost:3000/api/users).

## Using the REST API

You can access the REST API of the server using the following endpoints:

### `GET`

-   `/api/post/:id`: Fetch a single post by its `id`
-   `/api/user/:id/drafts`: Fetch user's drafts by their `id`
-   `/api/users`: Fetch all users

### `POST`

-   `/api/post`: Create a new post
    -   Body:
        -   `title: String` (required): The title of the post
        -   `content: String` (optional): The content of the post
        -   `authorEmail: String` (required): The email of the user that creates the post
-   `/api/signup`: Create a new user
    -   Body:
        -   `email: String` (required): The email address of the user
        -   `name: String` (optional): The name of the user

### `PUT`

-   `/api/publish/:id`: Toggle the publish value of a post by its `id`
-   `api/post/:id/views`: Increases the `viewCount` of a `Post` by one `id`

### `DELETE`

-   `/api/post/:id`: Delete a post by its `id`

## Project Structure

<pre>
.
├── <img src="./assets/icons/folder-resource.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> assets
│   └── <img src="./assets/icons/folder-images.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> icons
│   └── <img src="./assets/icons/folder-images.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> images
├── <img src="./assets/icons/folder-docs.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> docs
│   └── <img src="./assets/icons/folder-folder.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> contributing
│       └── <img src="./assets/icons/markdown.svg" style="display: inline-block; margin: 0; padding:0"  height="8"/> types-of-contributions.md
├── <img src="./assets/icons/folder-scripts.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> scripts
│   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> copy-files.script.ts
├── <img src="./assets/icons/folder-src.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> src
│   ├── <img src="./assets/icons/folder-api.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> api
│   │   ├── <img src="./assets/icons/folder-controller.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> controllers
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> post.controller.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> user.controller.ts
│   │   ├── <img src="./assets/icons/folder-error.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> errors
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> application.exception.ts
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> database.exception.ts
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> http.exception.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> validation.exception.ts
│   │   ├── <img src="./assets/icons/folder-helper.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> helpers
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> example.helper.ts
│   │   ├── <img src="./assets/icons/folder-interface.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> interfaces
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> postData.interface.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> route.interface.ts
│   │   ├── <img src="./assets/icons/folder-middleware.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> middleware
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> error.middleware.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> express.middleware.ts
│   │   ├── <img src="./assets/icons/folder-class.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> models
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> example.model.ts
│   │   ├── <img src="./assets/icons/folder-routes.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> routes
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> api.route.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> home.route.ts
│   │   ├── <img src="./assets/icons/folder-controller.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> services
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> post.service.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> user.service.ts
│   │   ├── <img src="./assets/icons/folder-utils.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> utils
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> iohandler.util.ts
│   │   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> logger.util.ts
│   │   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> secrets.util.ts
│   │   └── <img src="./assets/icons/folder-rules.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> validators
│   │       ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> post.validator.ts
│   │       └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> user.validator.ts
│   ├── <img src="./assets/icons/folder-app.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> app
│   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> index.ts
│   ├── <img src="./assets/icons/folder-config.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> config
│   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> helmet.config.ts
│   │   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> logger.config.ts
│   ├── <img src="./assets/icons/folder-prisma.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> prisma
│   │   ├── <img src="./assets/icons/folder-database.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> db
│   │   ├── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> db.seed.ts
│   │   └── <img src="./assets/icons/prisma.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> schema.prisma
│   ├── <img src="./assets/icons/folder-public.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> public
│   │   ├── <img src="./assets/icons/folder-css.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> css
│   │   ├── <img src="./assets/icons/favicon.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> favicon.ico
│   │   ├── <img src="./assets/icons/folder-font.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> fonts
│   │   ├── <img src="./assets/icons/folder-images.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> img
│   │   └── <img src="./assets/icons/folder-javascript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> js
│   └── <img src="./assets/icons/typescript.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> server.ts
├── <img src="./assets/icons/folder-test.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> tests
│   ├── <img src="./assets/icons/folder-coverage.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> e2e
│   ├── <img src="./assets/icons/folder-folder.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> fixtures
│   ├── <img src="./assets/icons/folder-folder.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> integration
│   └── <img src="./assets/icons/folder-folder.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> unit
│       └── <img src="./assets/icons/test-ts.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> api.test.ts
├── <img src="./assets/icons/tune.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .env
├── <img src="./assets/icons/eslint.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .eslintignore
├── <img src="./assets/icons/eslint.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .eslintrc.js
├── <img src="./assets/icons/git.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .gitattributes
├── <img src="./assets/icons/git.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .gitignore
├── <img src="./assets/icons/prettier.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> .prettierrc.js
├── <img src="./assets/icons/changelog.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> CHANGELOG.md
├── <img src="./assets/icons/conduct.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> CODE_OF_CONDUCT.md
├── <img src="./assets/icons/contributing.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> CONTRIBUTING.md
├── <img src="./assets/icons/certificate.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> LICENSE
├── <img src="./assets/icons/jest.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> jest.config.js
├── <img src="./assets/icons/nodejs.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> package-lock.json
├── <img src="./assets/icons/nodejs.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> package.json
├── <img src="./assets/icons/readme.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> README.md
├── <img src="./assets/icons/lock.svg" style="display: inline-block; margin: 0; padding:0"  height="12"/> SECURITY.md
└── <img src="./assets/icons/tsconfig.svg" style="display: inline-block; margin: 0; padding:0;"  height="12"/> tsconfig.json
</pre>

## Linting

## License

[MIT](LICENSE)
