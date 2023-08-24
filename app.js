const express = require('express');
const path = require('path');
const app = express();
const db = require("./config");
const fb = db.firestore();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({extends:false}))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"./views"));


app.get("/customer/:id", async(req,res)=>{
    try {
        
       const docId = req.params.id;
        const customerRef = fb.collection('customer').doc(docId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            res.json({ error: 'Customer not found' });
            return;
        }
        
        const customerData = customerDoc.data();
        if(customerData.status == "start"){
        //
        res.redirect("/startForm");
        }
        else if(customerData.status == "end"){
            res.redirect("/endForm");
        }
        else{
            res.render('confirm',{customerData:customerData,id:docId });
        }
    } catch (error) {
        console.error('Error fetching customer data:', error);
        
    }
})

app.post("/verify-otp", async(req,res)=>{
    const bookingId = req.query.id;
    const otp = req.body.otp;
   var data = await fb.collection('customer').doc(bookingId).get()
   console.log(data.data() , otp);
   if(data.data().otp == otp){
    //console.log(true);
   await fb.collection('customer').doc(bookingId).update({status:"start"})
   res.redirect("/startForm");
   }
   else{
    res.redirect("/customer/"+bookingId)
   }

})

app.post("/startTrip", async(req,res)=>{
    try{
        const {image, odometerReading} = req.body;
        
        // console.log({image, odometerReading});
       await fb.collection('customer').doc(docId)
        .update(odometerReading)
        .then(docRef => {
            console.log('Document written with ID: ', docRef.id);
        })
    }
    catch{
       console.log("error on db storage");
    }
})

app.post("/endTrip",async (req,res)=>{
    try{
         const {image, odometerReadingEnd} = req.body;
         const customerRef = fb.collection('customer').doc(docId);
         const customerDoc = await customerRef.get();
        
         
         if (!customerDoc.exists) {
             res.json({ error: 'Customer not found' });
             return;
         }
 
         const customerData = customerDoc.data();
         res.render('bill',{odometerReadingEnd},{customerData});
     } catch (error) {
         console.error('Error fetching customer data:', error);
         
     }
         
    
  
})

app.get("/startForm",(req,res)=>{
    res.render("startForm");
})

app.get("/endForm",(req,res)=>{
    res.render("endForm");
});


app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
})