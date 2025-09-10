# College Dating App - Signup Page

A React.js signup page for a college dating web app using Supabase for authentication.

## Features

- ✅ College email validation (must end with @rvce.edu.in)
- ✅ Password validation (minimum 6 characters)
- ✅ Supabase authentication integration
- ✅ Error handling and user feedback
- ✅ Success message and redirect to profile setup
- ✅ Modern, responsive UI design
- ✅ Loading states and form validation

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Update `src/supabaseClient.js` with your Supabase URL and API key
   - Replace `YOUR_SUPABASE_URL` and `YOUR_SUPABASE_ANON_KEY` with your actual values

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── SignupPage.js      # Main signup component
│   └── ProfileSetup.js    # Profile setup page (redirect destination)
├── App.js                 # Main app component with routing
├── App.css               # Styling for the application
├── index.js              # React app entry point
└── supabaseClient.js     # Supabase configuration
```

## Key Features Implemented

### Email Validation
- Validates email format using regex
- Ensures email ends with "@rvce.edu.in"
- Shows real-time error messages

### Password Validation
- Minimum 6 character requirement
- Real-time validation feedback

### Supabase Integration
- Uses `supabase.auth.signUp()` method
- Handles various error scenarios
- Provides user-friendly error messages

### User Experience
- Loading states during signup process
- Success messages with automatic redirect
- Responsive design for mobile and desktop
- Modern gradient background and card-based layout

## Error Handling

The app handles various error scenarios:
- Invalid email format
- Non-RVCE email addresses
- Weak passwords
- Already registered emails
- Network errors
- Supabase authentication errors

## Styling

- Modern gradient background
- Card-based layout with shadows
- Responsive design
- Smooth animations and transitions
- Loading spinner for better UX

## Next Steps

To complete the application, you might want to add:
- Login page
- Email verification handling
- Complete profile setup form
- Dashboard/feed page
- User matching functionality
