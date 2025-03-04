const express=require('express');
const app=express();

app.use(express.json());

app.get('/',(req,res)=>{
    res.status(200).json("Home Page");
})



const port=8000;
app.listen(port,()=>{
    console.log(`Server active on port ${port}`)
})