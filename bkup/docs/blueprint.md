# **App Name**: WonderKids Connect

## Core Features:

- User Authentication & Authorization: Enable secure login for Admin and Volunteer roles using Firebase Authentication, with role-based access control.
- Kid Profile Management: Admins can create, view, and update child profiles including photos (Firebase Storage) and detailed information (Firestore). This module supports managing unique IDs, contact details, medical notes, and tracking attendance/coins.
- Real-time Check-In & Celebration System: Provide a fast check-in/out interface for volunteers on Sundays. The system automatically records attendance in Firestore, awards coins, and utilizes a generative celebration tool to trigger animated confetti, balloons, and personalized messages for special occasions like birthdays or first-time visits.
- Coins & Rewards Tracking: Implement a system to track all earned coins from activities such as attendance and manually awarded merits, maintaining each child's current coin balance within Firestore.
- Gift Redemption Store: Admins can define and manage a catalog of gifts available for redemption (stored in Firestore). Children can use their earned coins to redeem these gifts, with all redemption transactions recorded for tracking.
- Volunteer Profiles & Basic Access Management: Admins can add, edit, and view volunteer profiles including contact information and roles. This allows for basic management of volunteer data and assignment of application access levels (Firestore).
- Ministry Operations Dashboard: A dashboard displaying key, real-time metrics for ministry leaders, such as current check-in counts, active volunteers, and recent attendance data to support Sunday operations.

## Style Guidelines:

- Light color scheme, reflecting openness and cheerfulness, suitable for a children's application. The primary color is a lively yellow-orange (#F2C366), evoking joy and celebration, ensuring good contrast with the background.
- Background color: A warm, heavily desaturated off-white (#F7F1E6), derived from the primary hue, providing a soft and inviting canvas.
- Accent color: A rich coral-red (#E0574F), analogous to the primary color but with significant difference in saturation and brightness to create distinct highlights and call-to-action elements.
- Headlines and body text: 'Poppins' (sans-serif) for its precise, contemporary, and geometric feel, aligning with the playful 'rounded cards' and general child-friendly aesthetic.
- Use fun, rounded, and illustrative icons that are child-friendly and support the joyful and colorful theme of the application, enhancing user engagement and clarity.
- Implement a responsive and intuitive layout with 'rounded cards', 'large buttons', and ample spacing to ensure ease of use for volunteers on various devices, especially iPads and phones for check-in.
- Utilize subtle UI animations for smooth transitions, complemented by impactful and 'celebrative sparkles' for key actions, featuring confetti and balloon effects for positive feedback like successful check-ins, coin awards, and birthday recognitions.