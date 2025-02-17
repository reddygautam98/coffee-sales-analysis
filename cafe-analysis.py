import pandas as pd
import numpy as np
from datetime import timedelta
from sklearn.metrics import mean_squared_error, mean_absolute_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from statsmodels.tsa.seasonal import seasonal_decompose
import matplotlib.pyplot as plt

# Original data preparation function
def prepare_data(data):
    # Convert string to DataFrame
    df = pd.read_csv(data)
    
    # Print the columns of the DataFrame
    print("DataFrame columns:", df.columns)
    
    # Convert Date Time to datetime
    df['Date Time'] = pd.to_datetime(df['Date Time'])
    
    # Add additional time-based columns
    df['Hour'] = df['Date Time'].dt.hour
    df['Month'] = df['Date Time'].dt.strftime('%B')
    df['Day'] = df['Date Time'].dt.day_name()
    df['Date'] = df['Date Time'].dt.date
    
    # Define time blocks
    def get_time_block(hour):
        if 6 <= hour < 12:
            return 'Morning'
        elif 12 <= hour < 17:
            return 'Afternoon'
        else:
            return 'Evening'
    
    df['Time Block'] = df['Hour'].apply(get_time_block)
    
    # Define seasonality
    def get_seasonality(hour):
        if 7 <= hour < 10:
            return 'Morning Peak'
        elif 12 <= hour < 14:
            return 'Lunch Peak'
        elif 17 <= hour < 19:
            return 'Evening Peak'
        else:
            return 'Low Traffic'
    
    df['Seasonality'] = df['Hour'].apply(get_seasonality)
    
    return df

# New function for customer segmentation
def analyze_customer_behavior(df):
    # Check if necessary columns exist
    if 'Transaction ID' not in df.columns or 'Total Price' not in df.columns:
        raise ValueError("DataFrame must contain 'Transaction ID' and 'Total Price' columns")
    
    # Create customer-level metrics
    customer_metrics = df.groupby('Transaction ID').agg({
        'Total Price': ['count', 'sum', 'mean'],
        'Date Time': ['min', 'max']
    }).reset_index()
    
    # Flatten column names
    customer_metrics.columns = ['Transaction ID', 'Visit Count', 'Total Spent', 
                              'Average Order Value', 'First Visit', 'Last Visit']
    
    # Calculate days since first purchase and purchase frequency
    customer_metrics['Customer Age'] = (
        customer_metrics['Last Visit'] - customer_metrics['First Visit']).dt.days
    customer_metrics['Purchase Frequency'] = (
        customer_metrics['Visit Count'] / customer_metrics['Customer Age'])
    
    # Segment customers based on RFM (Recency, Frequency, Monetary)
    current_date = df['Date Time'].max()
    customer_metrics['Recency'] = (
        current_date - customer_metrics['Last Visit']).dt.days
    
    # Create RFM segments
    def assign_segment(row):
        if row['Recency'] <= 30 and row['Purchase Frequency'] >= 0.5:
            return 'Loyal'
        elif row['Recency'] <= 60 and row['Purchase Frequency'] >= 0.2:
            return 'Regular'
        elif row['Recency'] <= 90:
            return 'Recent'
        else:
            return 'Churned'
    
    customer_metrics['Customer Segment'] = customer_metrics.apply(assign_segment, axis=1)
    
    return customer_metrics

# New function for sales forecasting
def forecast_sales(df, forecast_periods=30):
    # Prepare daily sales data
    daily_sales = df.groupby('Date')['Total Price'].sum().reset_index()
    daily_sales.set_index('Date', inplace=True)
    
    # Perform time series decomposition
    decomposition = seasonal_decompose(daily_sales['Total Price'], 
                                     period=7, # Weekly seasonality
                                     extrapolate_trend='freq')
    
    # Create and train Holt-Winters model
    model = ExponentialSmoothing(daily_sales['Total Price'],
                                seasonal_periods=7,
                                trend='add',
                                seasonal='add')
    fitted_model = model.fit()
    
    # Generate forecasts
    forecast = fitted_model.forecast(forecast_periods)
    forecast_df = pd.DataFrame({
        'Date': pd.date_range(start=daily_sales.index[-1] + timedelta(days=1),
                             periods=forecast_periods),
        'Forecasted Sales': forecast
    })
    
    # Calculate forecast metrics
    train_rmse = np.sqrt(mean_squared_error(
        daily_sales['Total Price'], fitted_model.fittedvalues))
    train_mae = mean_absolute_error(
        daily_sales['Total Price'], fitted_model.fittedvalues)
    
    forecast_metrics = {
        'RMSE': train_rmse,
        'MAE': train_mae,
        'Forecast Confidence': 1 - (train_mae / daily_sales['Total Price'].mean())
    }
    
    return forecast_df, forecast_metrics, decomposition

# Enhanced generate_insights function
def generate_insights(df):
    # Check if necessary columns exist
    if 'Total Price' not in df.columns or 'Quantity' not in df.columns:
        raise ValueError("DataFrame must contain 'Total Price' and 'Quantity' columns")
    
    # Original metrics
    total_sales = df['Total Price'].sum()
    total_orders = len(df)
    avg_order_value = total_sales / total_orders
    total_items_sold = df['Quantity'].sum()
    
    # Generate customer insights
    customer_metrics = analyze_customer_behavior(df)
    customer_metrics['Customer Segment'].value_counts()
    avg_customer_lifetime = customer_metrics['Customer Age'].mean()
    
    # Generate sales forecast
    forecast_df, forecast_metrics, decomposition = forecast_sales(df)
    
    # Combine all metrics
    overall_metrics = pd.DataFrame({
        'Metric': [
            'Total Sales', 'Total Orders', 'Average Order Value', 
            'Total Items Sold', 'Total Customers', 'Average Customer Lifetime (days)',
            'Forecast Accuracy', 'Expected Sales Growth'
        ],
        'Value': [
            f'${total_sales:,.2f}', 
            total_orders,
            f'${avg_order_value:.2f}',
            total_items_sold,
            len(customer_metrics),
            f'{avg_customer_lifetime:.1f}',
            f'{forecast_metrics["Forecast Confidence"]*100:.1f}%',
            f'{((forecast_df["Forecasted Sales"].mean() / df.groupby("Date")["Total Price"].sum().mean() - 1) * 100):.1f}%'
        ]
    })
    
    # Save enhanced insights
    overall_metrics.to_csv('overall_metrics_enhanced.csv', index=False)
    customer_metrics.to_csv('customer_metrics.csv', index=False)
    forecast_df.to_csv('sales_forecast.csv', index=False)
    
    # Original groupby analyses (kept for compatibility)
    hourly_sales = df.groupby('Hour')['Total Price'].agg(['sum', 'count']).reset_index()
    time_block_sales = df.groupby('Time Block')['Total Price'].agg(['sum', 'count']).reset_index()
    seasonality_sales = df.groupby('Seasonality')['Total Price'].agg(['sum', 'count']).reset_index()
    monthly_sales = df.groupby('Month')['Total Price'].agg(['sum', 'count']).reset_index()
    category_sales = df.groupby('Category')['Total Price'].agg(['sum', 'count']).reset_index()
    location_sales = df.groupby('Location')['Total Price'].agg(['sum', 'count']).reset_index()
    
    # Format and save all dataframes as before
    for df_temp in [hourly_sales, time_block_sales, seasonality_sales, 
                   monthly_sales, category_sales, location_sales]:
        df_temp.columns = [df_temp.columns[0], 'Total Sales', 'Order Count']
        df_temp['Average Order Value'] = df_temp['Total Sales'] / df_temp['Order Count']
        df_temp['Total Sales'] = df_temp['Total Sales'].apply(lambda x: f'${x:,.2f}')
        df_temp['Average Order Value'] = df_temp['Average Order Value'].apply(lambda x: f'${x:.2f}')
    
    return (overall_metrics, hourly_sales, time_block_sales, seasonality_sales,
            monthly_sales, category_sales, location_sales, 
            customer_metrics, forecast_df, forecast_metrics, decomposition)

# Function to plot forecast
def plot_forecast(daily_sales, forecast_df):
    plt.figure(figsize=(12, 6))
    plt.plot(daily_sales.index, daily_sales['Total Price'], label='Actual Sales')
    plt.plot(forecast_df['Date'], forecast_df['Forecasted Sales'], label='Forecasted Sales', linestyle='--')
    plt.xlabel('Date')
    plt.ylabel('Sales')
    plt.title('Sales Forecast')
    plt.legend()
    plt.grid(True)
    plt.show()

# Example usage:
if __name__ == "__main__":
    df = prepare_data(r"C:\Users\reddy\Downloads\coffee-sales-analysis\cafe_sales_data.csv")
    results = generate_insights(df)
    
    # Print key insights
    print("\nOverall Metrics:")
    print(results[0].to_string(index=False))
    
    print("\nCustomer Segments:")
    print(results[7]['Customer Segment'].value_counts())
    
    print("\nSales Forecast Metrics:")
    print(f"Forecast Accuracy: {results[9]['Forecast Confidence']*100:.1f}%")
    print(f"RMSE: ${results[9]['RMSE']:.2f}")
    
    # Plot forecast
    daily_sales = df.groupby('Date')['Total Price'].sum().reset_index()
    daily_sales.set_index('Date', inplace=True)
    plot_forecast(daily_sales, results[8])