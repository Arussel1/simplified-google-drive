# StrippedDownGoogleDrive Web App
Pet project to create a minizied Google Drive clone with Typescript, Node, Express, PostgreSQL, authentication with passport.js local startegy and PrismaORM for database interactions.  <br>
**Demo**: :point_right:[**Not yet ready**]():point_left:. <br>
Please allow up to 1 minutes for the website to load.
## Install and set up
Follow these step below to set up the website in your local machine.

### Prerequisites:
Ensure [Node](https://nodejs.org/en) and [npm](https://www.npmjs.comnode) are installed in your computer.
### Steps:
1. Clone the repo: <br>

```bash
git clone https://github.com/YourUserName/simplified-google-drive
```

2. Navigate to the project folder:<br>

```bash
cd simplified-google-drive
```

3. Install the dependencies:<br>

```bash
npm install
```

4. Create the .env file:<br>

```bash
touch .env
```

5. Add your environment inside the file: <br>

```bash
DATABASE_URL=
FOO_COOKIE_SECRET=
SUPABASE_KEY=
SUPABASE_URL=
```

6. Start the dev server:<br>

```bash
npm run dev
```


After these step, you should browser and navigate to http://localhost:3000 to view the application in action.
## Production:

To prepare the project for production deployment, please use the following command: <br>

```bash
npm start
```

## Tech stack:
+ [Node](https://nodejs.org/en) as runtime environment. <br>
+ [Pug](https://pugjs.org/api/getting-started.html) as server-side template rendering. <br>
+ [Express](https://expressjs.com/) as backend framework. <br>
+ [PostgreSQL](https://www.postgresql.org/) SQL database for storing user, folder, and file information. <br>
+ [TypeScript](https://www.typescriptlang.org/) strongly-typed language for building robust and scalable applications. <br>
+ [Passport](https://www.passportjs.org/) Authentication middleware for managing user authentication and session handling in Node applications. <br>
+ [Prisma](https://www.prisma.io/) Simplified database relation and query for SQL and NoSQL databases. <br>
+ [Supabase](https://supabase.com/) Store images, videos, documents, and any other file type.
