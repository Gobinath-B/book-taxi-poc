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
       //console.log(docId);
        const customerRef = fb.collection('BookingDetails').doc(docId);
        const customerDoc = await customerRef.get();
        const inputNum = "+91"+req.body.Dphone;
        const customerData = customerDoc.data();
        if (!customerDoc.exists) {
            res.json({ error: 'Driver not found' });
            return;
        }
        
       
        else if(customerData.driverPhone == inputNum){
            
            res.render('confirm',{customerData:customerData,id:docId });
            return;
        }
       // if(customerData.status == "start"){
        //
        //res.redirect("/startForm");
        // }
        // else if(customerData.status == "end"){
        //     res.redirect("/endForm");
        // }
        else{
            const verified = false; 
            res.render("verification",{id:docId,verified:verified});
            return;
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
        const date = req.body.dateId;
        // const time = req.body.time;
        //console.log(req.body.time);
        const otp = req.body.otp;
        var data = await fb.collection('BookingDetails').doc(bookingId).get()
       //console.log(data.data() , otp);
        if(data.data().otp == otp){
         //console.log(true);
        await fb.collection('BookingDetails').doc(bookingId).update({status:"start",startOdometerDate:date,startOdometerValue:odometerReading,startOdometerImage:imageRef})
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
         //console.log(req.body);
         const bookingId = req.body.id;
         const date = req.body.dateId;
         //console.log(date);
        
         await fb.collection('BookingDetails').doc(bookingId).update({endOdometerDate:date,endOdometerValue:odometerReadingEnd,endOdometerImage:imageRef,status:"end"})
         var data =  await fb.collection('BookingDetails').doc(bookingId).get()
         const name = data.data().custName;
         const service = data.data().trip;
         const driverName = data.data().driverName;
         const beta = data.data().driverBata;
         const from = data.data().from;
         const to = data.data().to;
         const start = data.data().startOdometerValue;
         const end = data.data().endOdometerValue;
         const phone = data.data().custPhone;
         const ratePerKm = data.data().kmPrice;
         const taxPercent = data.data().taxPercent;
         const carName = data.data().carName;
         const status = data.data().status;
         const totalDistance = end - start;
         let betaAmount = beta;
         const sDate = data.data().startOdometerDate;
         const eDate =  data.data().endOdometerDate;
         const startDate = new Date(sDate);
         const endDate = new Date(eDate);
         const totalTime = startDate.getTime() - endDate.getTime();
         let totalDays = Math.abs(Math.ceil(totalTime / (1000 * 3600 * 24))); 
         totalDays +=1;
         let totalAmount ;
         let amount ;
        //  console.log(totalDays);
        //  console.log(ratePerKm);
        //  console.log(totalDistance);
        //  console.log(totalAmount);
        //  console.log(beta);
        //  console.log(betaAmount);
        //  console.log(amount);
        
         if(service == "One Way Trip"){
            if(totalDistance <130){
                amount = 130 * parseInt(ratePerKm);
            }
            else{
               amount = parseInt(totalDistance) * parseInt(ratePerKm);
            }
         }
         else{
            if(totalDistance <= 250 * totalDays){
                let distance = (totalDays*250);
                amount = distance * parseInt(ratePerKm);
            }
            else{
                amount = parseInt(totalDistance) * parseInt(ratePerKm);   
            }
         }
         
         if(parseInt(totalDays) == 1){
            totalAmount = amount + beta;
         }
         else{
            
            betaAmount = parseInt(totalDays) * beta ; 
            totalAmount = amount + (betaAmount);
         }
         const jsonData = {
            bookingId:bookingId,
            service:service,
            driverName: driverName,
            name:name,
            from:from,
            to:to,
            phone:phone,
            carName: carName,
            start: start,
            end: end,
            ratePerKm: ratePerKm,
            betaAmount: betaAmount,
            totalDistance: totalDistance,
            totalAmount: totalAmount
          };
          //console.log(totalAmount);
         //await fb.collection('BookingDetails').doc(bookingId).update({amount:totalAmount,travel_distance:totalDistance})
         //.then(()=>{
            res.render("bill",{jsonData});
         //})
         
        
     } catch (error) {
         console.error('Error fetching customer data:', error);
         
     }
})

app.get("/startForm",(req,res)=>{
    res.render("startForm");
})



app.get("/booking/:id",async(req,res)=>{
   try{ 
    const docId = req.params.id;
        
        const customerRef = fb.collection('BookingDetails').doc(docId);
        const customerDoc = await customerRef.get();
        console.log(customerDoc);
        if (!customerDoc.exists) {
            res.json({ error: 'Customer not found',docId:docId });
            // console.log(req.params.id);
            return;
        }
        const verified = true;
        const customerData = customerDoc.data();
        res.render('verification',{id:docId ,verified:verified});

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

// app.post("/location",(req,res)=>{
//    const latitude = req.body.latitude;
//    const longitude = req.body.longitude;
//    console.log(latitude,longitude);
// });

app.listen(PORT,()=>{
    console.log(`listening on ${PORT}`)
})