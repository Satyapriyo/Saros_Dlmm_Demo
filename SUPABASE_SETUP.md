# Supabase Setup Guide for DLMM Trading App

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Set up your project:
   - Name: `dlmm-trading-app` (or your preferred name)
   - Database Password: Choose a strong password
   - Region: Choose the closest region to your users
5. Wait for the project to be provisioned (this may take a few minutes)

## Step 2: Get Your Project Credentials

Once your project is ready:

1. Go to your project dashboard
2. Click on the "Settings" icon in the left sidebar
3. Click on "API"
4. Copy the following values:
   - Project URL
   - Anon public key

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Create the Database Schema

1. In your Supabase dashboard, go to the "SQL Editor" in the left sidebar
2. Click "New Query"
3. Copy and paste the SQL schema below:

```sql
-- Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('limit', 'stop-loss')),
    token_from VARCHAR NOT NULL,
    token_to VARCHAR NOT NULL,
    amount DECIMAL NOT NULL,
    target_price DECIMAL NOT NULL,
    current_price DECIMAL,
    status VARCHAR(10) NOT NULL CHECK (status IN ('active', 'executed', 'cancelled', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pair_address VARCHAR NOT NULL,
    user_wallet VARCHAR NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_user_wallet ON orders(user_wallet);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_pair_address ON orders(pair_address);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see and manipulate their own orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid()::text = user_wallet OR auth.role() = 'service_role');

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid()::text = user_wallet OR auth.role() = 'service_role');

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid()::text = user_wallet OR auth.role() = 'service_role');

CREATE POLICY "Users can delete their own orders" ON orders
    FOR DELETE USING (auth.uid()::text = user_wallet OR auth.role() = 'service_role');

-- Note: The policies above use auth.uid() which requires Supabase Auth
-- Since we're using Solana wallets, we might want to disable RLS for now
-- and handle authorization in the application layer
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
```

4. Click "Run" to execute the schema

## Step 5: Optional - Set up Real-time Subscriptions

If you want real-time updates when orders change:

1. Go to "Database" > "Replication" in your Supabase dashboard
2. Turn on "Enable Realtime" for the `orders` table

## Step 6: Test Your Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Connect your wallet and try creating a test order
3. Check your Supabase dashboard under "Table Editor" > "orders" to see if the order was created

## Security Considerations

### For Production:

1. **Enable Row Level Security (RLS)**: Uncomment the RLS policies in the schema
2. **Environment Variables**: Make sure your environment variables are properly set
3. **API Keys**: Never commit your `.env.local` file to version control
4. **Database Access**: Consider using Supabase's built-in auth or implement your own authentication layer

### Database Backup:

1. Go to "Settings" > "Database" in your Supabase dashboard
2. Enable automatic backups for production use

## Troubleshooting

### Common Issues:

1. **Connection Errors**: Double-check your environment variables
2. **CORS Issues**: Make sure your domain is allowed in Supabase settings
3. **RLS Errors**: If you enable RLS, make sure your policies are correctly configured
4. **Type Errors**: Ensure your database types match your TypeScript interfaces

### Debugging:

- Check the browser console for error messages
- Use Supabase's logs in the dashboard to see database queries
- Test your connection using the Supabase SQL editor

## Next Steps

1. Consider implementing user authentication with Supabase Auth
2. Set up monitoring and logging for production
3. Implement proper error handling and retry logic
4. Add data validation at the database level
5. Set up automated backups and disaster recovery

## Additional Features You Can Add

1. **Order History**: Keep a separate table for executed orders
2. **Portfolio Tracking**: Track user's trading performance
3. **Price Alerts**: Send notifications when price targets are hit
4. **Order Templates**: Save frequently used order configurations
5. **Analytics**: Track trading patterns and success rates
