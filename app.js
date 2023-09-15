const express = require('express');
const path = require('path');
const app = express();
const db = require("./config");
const { render } = require('ejs');
const exp = require('constants');
const fb = db.firestore();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static('Public'));
app.use(express.urlencoded({extends:false}))
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"./views"));

app.post("/customer", async(req,res)=>{
    try {
        
       const docId = req.body.Id;
       console.log(docId);
        const customerRef = fb.collection('customer').doc(docId);
        const customerDoc = await customerRef.get();
        const inputNum = req.body.Dphone
        const customerData = customerDoc.data();
        if (!customerDoc.exists) {
            res.json({ error: 'Driver not found' });
            return;
        }
        
       
        else if(customerData.DriverPhone == inputNum){
            res.render('confirm',{customerData:customerData,id:docId });
        }
       // if(customerData.status == "start"){
        //
        //res.redirect("/startForm");
        // }
        // else if(customerData.status == "end"){
        //     res.redirect("/endForm");
        // }
        else{
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error fetching customer data:', error);
        
    }
})

// app.post("/verify-otp", async(req,res)=>{
//     const bookingId = req.query.id;
//     const otp = req.body.otp;
//    var data = await fb.collection('customer').doc(bookingId).get()
//    console.log(data.data() , otp);
//    if(data.data().otp == otp){
//     //console.log(true);
//    await fb.collection('customer').doc(bookingId).update({status:"start"})
//    res.redirect("/startForm");
//    }
//    else{
//     res.redirect("/customer/"+bookingId)
//    }

// })

app.post("/startTrip", async(req,res)=>{
    try{
        const {imageRef, odometerReading} = req.body;
        const bookingId = req.body.id;
       // console.log(req.body.id);
        const otp = req.body.otp;
        var data = await fb.collection('customer').doc(bookingId).get()
       // console.log(data.data() , otp);
        if(data.data().otp == otp){
         //console.log(true);
        await fb.collection('customer').doc(bookingId).update({status:"start",start:odometerReading,image:imageRef})
        //await fb.collection('customer').doc(bookingId).update({start:odometerReading,image:imageRef})
       
          .then(() => {
            console.log('Document written with ID: ', bookingId);
            res.redirect("/endForm");
           
          })
        }
        else{
         res.redirect("/customer/"+bookingId)
        }

       
    }
    catch(error){
       console.log("error on db storage",error);
    }
})

app.post("/endTrip",async (req,res)=>{
    try{
         const {imageRef, odometerReadingEnd} = req.body;
         console.log(req.body);
         const bookingId = req.body.id;
           
         await fb.collection('customer').doc(bookingId).update({end:odometerReadingEnd,imageEnd:imageRef,status:"end"})
         var data =  await fb.collection('customer').doc(bookingId).get()
         const name = data._fieldsProto.name.stringValue;
         const service = data._fieldsProto.service.stringValue;
         const driverName = data._fieldsProto.driverName.stringValue;
         const beta = data._fieldsProto.beta.integerValue;
         const from = data._fieldsProto.from.stringValue;
         const to = data._fieldsProto.to.stringValue;
         const start = data._fieldsProto.start.stringValue;
         const end = data._fieldsProto.end.stringValue;
         const phone = data._fieldsProto.Phone.integerValue;
         const ratePerKm = data._fieldsProto.ratePerKm.integerValue;
         const tax = data._fieldsProto.tax.integerValue;
         const car = data._fieldsProto.car.stringValue;
         const status = data._fieldsProto.status.stringValue;
         const totalDistance = end - start;
         const extra = parseInt(tax)  +parseInt(beta);
         const totalAmount = parseInt(totalDistance * ratePerKm )+ parseInt(extra);
         console.log(totalAmount,extra);
         console.log(beta,tax,totalDistance,ratePerKm);
         const jsonData = {
            bookingId:bookingId,
            service:service,
            driverName: driverName,
            name:name,
            from:from,
            to:to,
            phone:phone,
            car: car,
            start: start,
            end: end,
            ratePerKm: ratePerKm,
            beta:beta,
            tax:tax,
            totalDistance: totalDistance,
            totalAmount: totalAmount
          };
         await fb.collection('customer').doc(bookingId).update({amount:totalAmount,travel_distance:totalDistance})
         .then(()=>{
            res.render("bill",{jsonData});
         })
         
        
     } catch (error) {
         console.error('Error fetching customer data:', error);
         
     }
})

app.get("/startForm",(req,res)=>{
    res.render("startForm");
})



app.get("/:id",async(req,res)=>{
   try{ 
    const docId = req.params.id;
        const customerRef = fb.collection('customer').doc(docId);
        const customerDoc = await customerRef.get();

        if (!customerDoc.exists) {
            res.json({ error: 'Customer not found' });
            return;
        }
        
        const customerData = customerDoc.data();
        res.render('verification',{customerData:customerData,id:docId });

    }catch (error) {
            console.error('Error fetching customer data:', error);
            
        }
})

app.get("/bill",(req,res)=>{
    res.render("bill");
})

app.get("/endForm",(req,res)=>{
    res.render("endForm");
});

app.post("/location",(req,res)=>{
   const latitude = req.body.latitude;
   const longitude = req.body.longitude;
   console.log(latitude,longitude);
});

app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
})