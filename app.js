const express = require('express');
const path = require('path');
const app = express();
const db = require("./config");
const { render } = require('ejs');
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
       // if(customerData.status == "start"){
        //
        //res.redirect("/startForm");
        // }
        // else if(customerData.status == "end"){
        //     res.redirect("/endForm");
        // }
        // else{
             res.render('confirm',{customerData:customerData,id:docId });
        // }
    } catch (error) {
        console.error('Error fetching customer data:', error);
        
    }
})

app.post("/verify-otp", async(req,res)=>{
    const bookingId = req.query.id;
    const otp = req.body.otp;
   var data = await fb.collection('customer').doc(bookingId).get();
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
        const bookingId = req.body.id;
        //console.log({image, odometerReading});
       await fb.collection('customer').doc(bookingId).update({start:odometerReading},)
        
        .then(() => {
            console.log('Document written with ID: ', bookingId);
            res.redirect("/endForm");
        })
    }
    catch{
       console.log("error on db storage");
    }
})

app.post("/endTrip",async (req,res)=>{
    try{
         const {image, odometerReadingEnd} = req.body;
         const bookingId = req.body.id;
           
         await fb.collection('customer').doc(bookingId).update({end:odometerReadingEnd})
         var data =  await fb.collection('customer').doc(bookingId).get()
         const start = data._fieldsProto.start.stringValue;
         const end = data._fieldsProto.end.stringValue;
         const phone = data._fieldsProto.Phone.integerValue;
         const ratePerKm = data._fieldsProto.ratePerKm.integerValue;
         const car = data._fieldsProto.car.stringValue;
         const totalDistance = end - start;
         const totalAmount = totalDistance * ratePerKm;
         const jsonData = {
            car: car,
            start: start,
            end: end,
            ratePerKm: ratePerKm,
            totalDistance: totalDistance,
            totalAmount: totalAmount
          };
         await fb.collection('customer').doc(bookingId).update({amount:totalAmount})
         res.render("bill",{jsonData})
        
     } catch (error) {
         console.error('Error fetching customer data:', error);
         
     }
})

app.get("/startForm",(req,res)=>{
    res.render("startForm");
})

app.get("/bill",(req,res)=>{
    res.render("bill");
})

app.get("/endForm",(req,res)=>{
    res.render("endForm");
});


app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
})