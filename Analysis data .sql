-- Data file path: C:\Users\reddy\Downloads\coffee-sales-analysis\cafe_sales_data.csv



-- Create transactions table
CREATE TABLE transactions (
    transaction_id VARCHAR(50) PRIMARY KEY,
    date_time DATETIME,
    total_price DECIMAL(10,2),
    quantity INT,
    category VARCHAR(50),
    location VARCHAR(100),
    hour INT,
    month VARCHAR(20),
    day_name VARCHAR(20),
    time_block VARCHAR(20),
    seasonality VARCHAR(20)
);

-- Load data from CSV file into transactions table
LOAD DATA INFILE 'C:/Users/reddy/Downloads/coffee-sales-analysis/cafe_sales_data.csv'
INTO TABLE transactions
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(transaction_id, date_time, total_price, quantity, category, location, hour, month, day_name, time_block, seasonality);

-- Create customer_metrics table
CREATE TABLE customer_metrics (
    transaction_id VARCHAR(50) PRIMARY KEY,
    visit_count INT,
    total_spent DECIMAL(10,2),
    average_order_value DECIMAL(10,2),
    first_visit DATETIME,
    last_visit DATETIME,
    customer_age INT,
    purchase_frequency DECIMAL(5,2),
    recency INT,
    customer_segment VARCHAR(20),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id)
);

-- Insert sample customer metrics
INSERT INTO customer_metrics VALUES
('T001', 5, 75.95, 15.19, '2024-01-01 08:30:00', '2024-02-17 08:30:00', 47, 0.11, 0, 'Loyal'),
('T002', 3, 65.50, 21.83, '2024-01-15 12:15:00', '2024-02-17 12:15:00', 33, 0.09, 0, 'Regular'),
('T003', 1, 18.75, 18.75, '2024-02-17 17:45:00', '2024-02-17 17:45:00', 1, 1.00, 0, 'Recent'),
('T004', 2, 25.98, 12.99, '2024-02-01 09:20:00', '2024-02-18 09:20:00', 17, 0.12, 0, 'Regular');

-- Create sales_forecast table
CREATE TABLE sales_forecast (
    forecast_date DATE PRIMARY KEY,
    forecasted_sales DECIMAL(10,2)
);

-- Insert sample forecast data
INSERT INTO sales_forecast VALUES
('2024-02-19', 250.00),
('2024-02-20', 275.50),
('2024-02-21', 285.75),
('2024-02-22', 295.25);

-- Create sales_metrics table
CREATE TABLE sales_metrics (
    metric_id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100),
    metric_value VARCHAR(50),
    date_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample metrics
INSERT INTO sales_metrics (metric_name, metric_value) VALUES
('Total Daily Sales', '$583.24'),
('Average Order Value', '$18.23'),
('Customer Count', '4'),
('Most Popular Category', 'Coffee'),
('Peak Time Block', 'Morning');

-- Create aggregated sales views
CREATE VIEW hourly_sales_summary AS
SELECT 
    hour,
    COUNT(*) as transaction_count,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY hour
ORDER BY hour;

CREATE VIEW category_sales_summary AS
SELECT 
    category,
    COUNT(*) as transaction_count,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY category
ORDER BY total_sales DESC;

-- Sales Analysis by Time Period
SELECT 
    EXTRACT(HOUR FROM date_time) as hour,
    COUNT(*) as num_transactions,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY hour
ORDER BY hour;

-- Peak Hours Analysis
SELECT 
    time_block,
    COUNT(*) as num_transactions,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY time_block
ORDER BY total_sales DESC;

-- Monthly Sales Trends
SELECT 
    DATE_FORMAT(date_time, '%Y-%m') as month,
    COUNT(*) as num_transactions,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY month
ORDER BY month;

-- Customer Segment Analysis
SELECT 
    customer_segment,
    COUNT(*) as num_customers,
    AVG(total_spent) as avg_customer_value,
    AVG(visit_count) as avg_visits,
    AVG(customer_age) as avg_customer_age
FROM customer_metrics
GROUP BY customer_segment
ORDER BY avg_customer_value DESC;

-- Location Performance
SELECT 
    t.location,
    COUNT(DISTINCT t.transaction_id) as num_transactions,
    SUM(t.total_price) as total_sales,
    AVG(t.total_price) as avg_order_value,
    COUNT(DISTINCT CASE WHEN cm.customer_segment = 'Loyal' 
        THEN cm.transaction_id END) as loyal_customers
FROM transactions t
LEFT JOIN customer_metrics cm ON t.transaction_id = cm.transaction_id
GROUP BY t.location
ORDER BY total_sales DESC;

-- Category Performance
SELECT 
    category,
    COUNT(*) as num_transactions,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value,
    SUM(quantity) as items_sold
FROM transactions
GROUP BY category
ORDER BY total_sales DESC;

-- Day of Week Analysis
SELECT 
    DAYNAME(date_time) as day_of_week,
    COUNT(*) as num_transactions,
    SUM(total_price) as total_sales,
    AVG(total_price) as avg_order_value
FROM transactions
GROUP BY day_of_week
ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 
    'Thursday', 'Friday', 'Saturday', 'Sunday');

-- Customer Retention Analysis
WITH customer_visits AS (
    SELECT 
        transaction_id,
        DATEDIFF(last_visit, first_visit) as days_between_visits,
        visit_count,
        customer_segment
    FROM customer_metrics
)
SELECT 
    customer_segment,
    AVG(days_between_visits) as avg_days_between_visits,
    AVG(visit_count) as avg_visits_per_customer,
    COUNT(*) as segment_size
FROM customer_visits
GROUP BY customer_segment
ORDER BY avg_visits_per_customer DESC;

-- Sales Growth Analysis
WITH monthly_sales AS (
    SELECT 
        DATE_FORMAT(date_time, '%Y-%m') as month,
        SUM(total_price) as monthly_sales
    FROM transactions
    GROUP BY month
)
SELECT 
    month,
    monthly_sales,
    LAG(monthly_sales) OVER (ORDER BY month) as prev_month_sales,
    ((monthly_sales - LAG(monthly_sales) OVER (ORDER BY month)) / 
        LAG(monthly_sales) OVER (ORDER BY month) * 100) as growth_rate
FROM monthly_sales
ORDER BY month;

-- Forecasting Performance Analysis
SELECT 
    DATE(forecast_date) as forecast_date,
    forecasted_sales,
    actual_sales,
    ((forecasted_sales - actual_sales) / actual_sales * 100) as forecast_error
FROM sales_forecast sf
JOIN (
    SELECT 
        DATE(date_time) as date,
        SUM(total_price) as actual_sales
    FROM transactions
    GROUP BY DATE(date_time)
) actual ON sf.forecast_date = actual.date
ORDER BY forecast_date;