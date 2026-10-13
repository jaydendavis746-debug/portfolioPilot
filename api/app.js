import express from 'express'
import cors from 'cors'
import categoryRouter from './router/category.js'
import dashboardRouter from './router/dashboard.js'
import goalRouter from './router/goal.js'
import transactionRouter from './router/transaction.js'
import userRouter from './router/user.js'


const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next)=>{
    req.userId = 1;
    next();
})

app.use("/categories", categoryRouter);
app.use("/transactions", transactionRouter);
app.use("/goals", goalRouter);
app.use("/dashboard", dashboardRouter);
app.use("/users", userRouter);

export default app;