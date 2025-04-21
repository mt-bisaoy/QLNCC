const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// ✅ Middleware
const corsOptions = {
  origin: 'http://127.0.0.1:5500',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Routes
const materialRoutes = require("./routes/material");
const suppliersRouter = require('./routes/suppliers');
const warehouseRoutes = require('./routes/warehouse');


const orderRoutes = require('./routes/order');

app.use("/api/material", materialRoutes);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/order', orderRoutes);


// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
