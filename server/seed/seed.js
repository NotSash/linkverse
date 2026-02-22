const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

/**
 * LinkVerse Database Seed Script
 *
 * Usage:
 *   cd server
 *   npm run seed
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const User = require('../models/User');
const Payment = require('../models/Payment');
const Admin = require('../models/Admin');
const OTP = require('../models/OTP');
const Contact = require('../models/Contact');

// ——— Helpers ————————————————————————————————————————————————

const generateAnalyticsData = (days = 30, viewRange = [10, 200], clickRange = [5, 100]) => {
  const viewsByDate = [];
  const clicksByDate = [];
  let totalViews = 0;
  let totalClicks = 0;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const views = Math.floor(Math.random() * (viewRange[1] - viewRange[0]) + viewRange[0]);
    const clicks = Math.floor(Math.random() * (clickRange[1] - clickRange[0]) + clickRange[0]);

    viewsByDate.push({ date, count: views });
    clicksByDate.push({ date, count: clicks });
    totalViews += views;
    totalClicks += clicks;
  }

  return {
    totalViews,
    totalClicks,
    viewsByDate,
    clicksByDate,
    topReferrers: [
      { source: 'Instagram', count: Math.floor(totalViews * 0.35) },
      { source: 'YouTube', count: Math.floor(totalViews * 0.20) },
      { source: 'Twitter/X', count: Math.floor(totalViews * 0.15) },
      { source: 'WhatsApp', count: Math.floor(totalViews * 0.10) },
      { source: 'Google', count: Math.floor(totalViews * 0.08) },
      { source: 'Direct', count: Math.floor(totalViews * 0.12) },
    ],
    visitorLocations: [
      { city: 'Mumbai', state: 'Maharashtra', count: Math.floor(totalViews * 0.18) },
      { city: 'Delhi', state: 'Delhi', count: Math.floor(totalViews * 0.15) },
      { city: 'Bangalore', state: 'Karnataka', count: Math.floor(totalViews * 0.12) },
      { city: 'Hyderabad', state: 'Telangana', count: Math.floor(totalViews * 0.09) },
      { city: 'Chennai', state: 'Tamil Nadu', count: Math.floor(totalViews * 0.07) },
      { city: 'Kolkata', state: 'West Bengal', count: Math.floor(totalViews * 0.06) },
      { city: 'Pune', state: 'Maharashtra', count: Math.floor(totalViews * 0.05) },
      { city: 'Ahmedabad', state: 'Gujarat', count: Math.floor(totalViews * 0.04) },
    ],
  };
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const daysFromNow = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
};

// ——— Main ————————————————————————————————————————————————————

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not set in .env file');
      process.exit(1);
    }

    console.log('\n===========================================');
    console.log('🌱 LinkVerse Database Seed Script');
    console.log('===========================================\n');

    await mongoose.connect(mongoUri, { family: 4 });
    console.log('✅ Connected to MongoDB\n');

    // Clear all collections
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Payment.deleteMany({}),
      Admin.deleteMany({}),
      OTP.deleteMany({}),
      Contact.deleteMany({}),
    ]);
    console.log('   ✅ All collections cleared\n');

    // Passwords — pre-save hooks on User and Admin will hash automatically
    const USER_PASSWORD = 'Password@123';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

    // ——— Create Admin ——————————————————————————————————————
    console.log('🔧 Creating admin account...');
    const admin = await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@linkverse.com',
      password: ADMIN_PASSWORD,
      role: 'superadmin',
    });
    console.log(`   ✅ Admin: ${admin.email}\n`);

    // ——— Create Demo Users —————————————————————————————————
    console.log('👥 Creating demo users...\n');

    const priya = await User.create({
      fullName: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9876543210',
      username: 'priya.fashion',
      password: USER_PASSWORD,
      bio: 'Fashion & Lifestyle Creator 👗✨ | Mumbai | Spreading desi fashion vibes 🇮🇳',
      category: 'Fashion',
      city: 'Mumbai',
      state: 'Maharashtra',
      isVerified: true,
      isPro: true,
      subscriptionStatus: 'active',
      subscriptionStartDate: daysAgo(15),
      subscriptionEndDate: daysFromNow(15),
      theme: {
        backgroundColor: '#fce4ec',
        cardColor: '#ffffff',
        textColor: '#4a4a4a',
        buttonColor: '#f48fb1',
        buttonTextColor: '#ffffff',
        fontFamily: 'Nunito',
        buttonStyle: 'pill',
        backgroundType: 'solid',
        gradientFrom: '#fce4ec',
        gradientTo: '#f3e5f5',
      },
      links: [
        { title: 'My Instagram 📸', url: 'https://instagram.com/priya.fashion', platform: 'Instagram Post', isActive: true, clickCount: 342, order: 0 },
        { title: 'YouTube Fashion Vlogs 🎬', url: 'https://youtube.com/@priyafashion', platform: 'YouTube Channel', isActive: true, clickCount: 278, order: 1 },
        { title: 'Shop My Meesho Store 🛍️', url: 'https://meesho.com/priyafashion', platform: 'Meesho', isActive: true, clickCount: 156, order: 2 },
        { title: 'My Fashion Blog ✍️', url: 'https://priyafashion.blog', platform: 'Blog Post', isActive: true, clickCount: 89, order: 3 },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/priya.fashion',
        youtube: 'https://youtube.com/@priyafashion',
        twitter: 'https://twitter.com/priyafashion',
        pinterest: 'https://pinterest.com/priyafashion',
        threads: 'https://threads.net/@priya.fashion',
        whatsapp: 'https://wa.me/919876543210',
        sharechat: 'https://sharechat.com/priyafashion',
        moj: 'https://mojapp.in/@priyafashion',
      },
      analytics: generateAnalyticsData(30, [50, 250], [20, 120]),
      seoSettings: {
        metaTitle: 'Priya Sharma — Fashion & Lifestyle Creator',
        metaDescription: 'Fashion and lifestyle creator from Mumbai. Follow me for desi fashion, styling tips, and shopping hauls!',
      },
    });
    console.log('   ✅ @priya.fashion — Fashion Creator, Mumbai (Active Pro)');

    const techraj = await User.create({
      fullName: 'Raj Kumar',
      email: 'raj@example.com',
      phone: '9876543211',
      username: 'techraj',
      password: USER_PASSWORD,
      bio: 'Tech Reviewer & Developer 💻 | Bangalore | Making tech simple for India 🇮🇳',
      category: 'Tech',
      city: 'Bangalore',
      state: 'Karnataka',
      isVerified: true,
      isPro: true,
      subscriptionStatus: 'active',
      subscriptionStartDate: daysAgo(10),
      subscriptionEndDate: daysFromNow(20),
      theme: {
        backgroundColor: '#1a1a2e',
        cardColor: '#16213e',
        textColor: '#e0e0e0',
        buttonColor: '#00d2ff',
        buttonTextColor: '#1a1a2e',
        fontFamily: 'Inter',
        buttonStyle: 'rounded',
        backgroundType: 'solid',
        gradientFrom: '#1a1a2e',
        gradientTo: '#16213e',
      },
      links: [
        { title: 'Tech Reviews on YouTube 📱', url: 'https://youtube.com/@techraj', platform: 'YouTube Channel', isActive: true, clickCount: 567, order: 0 },
        { title: 'GitHub Projects 💻', url: 'https://github.com/techraj', platform: 'Website', isActive: true, clickCount: 234, order: 1 },
        { title: 'My Tech Blog 📝', url: 'https://techraj.dev/blog', platform: 'Blog Post', isActive: true, clickCount: 189, order: 2 },
        { title: 'Follow on Twitter 🐦', url: 'https://twitter.com/techraj', platform: 'Custom URL', isActive: true, clickCount: 145, order: 3 },
        { title: 'Book a 1:1 Session 📞', url: 'https://topmate.io/techraj', platform: 'Topmate', isActive: true, clickCount: 98, order: 4 },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/techraj',
        youtube: 'https://youtube.com/@techraj',
        twitter: 'https://twitter.com/techraj',
        github: 'https://github.com/techraj',
        linkedin: 'https://linkedin.com/in/techraj',
        discord: 'https://discord.gg/techraj',
        medium: 'https://medium.com/@techraj',
      },
      analytics: generateAnalyticsData(30, [80, 350], [30, 150]),
      seoSettings: {
        metaTitle: 'TechRaj — Tech Reviews & Developer Content',
        metaDescription: 'Tech reviewer and developer from Bangalore. Honest reviews, coding tutorials, and making technology accessible for India.',
      },
    });
    console.log('   ✅ @techraj — Tech Reviewer, Bangalore (Active Pro)');

    const fitnessguru = await User.create({
      fullName: 'Amit Singh',
      email: 'amit@example.com',
      phone: '9876543212',
      username: 'fitnessguru',
      password: USER_PASSWORD,
      bio: 'Fitness Coach & Nutritionist 💪 | Delhi | Transform your body & mind 🔥',
      category: 'Fitness',
      city: 'Delhi',
      state: 'Delhi',
      isVerified: true,
      isPro: true,
      subscriptionStatus: 'active',
      subscriptionStartDate: daysAgo(25),
      subscriptionEndDate: daysFromNow(5),
      theme: {
        backgroundColor: '#0a0a0a',
        cardColor: '#1a1a1a',
        textColor: '#ffffff',
        buttonColor: '#ff006e',
        buttonTextColor: '#ffffff',
        fontFamily: 'Outfit',
        buttonStyle: 'outline',
        backgroundType: 'solid',
        gradientFrom: '#0a0a0a',
        gradientTo: '#1a1a1a',
      },
      links: [
        { title: 'Workout Videos 💪', url: 'https://youtube.com/@fitnessguru', platform: 'YouTube Channel', isActive: true, clickCount: 423, order: 0 },
        { title: 'Follow on Instagram 📸', url: 'https://instagram.com/fitnessguru', platform: 'Instagram Post', isActive: true, clickCount: 312, order: 1 },
        { title: 'WhatsApp for Coaching 📞', url: 'https://wa.me/919876543212', platform: 'WhatsApp', isActive: true, clickCount: 178, order: 2 },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/fitnessguru',
        youtube: 'https://youtube.com/@fitnessguru',
        whatsapp: 'https://wa.me/919876543212',
        twitter: 'https://twitter.com/fitnessguru',
        telegram: 'https://t.me/fitnessguru',
      },
      analytics: generateAnalyticsData(30, [40, 180], [15, 80]),
      seoSettings: {
        metaTitle: 'Amit Singh — Fitness Coach & Nutritionist',
        metaDescription: 'Certified fitness coach and nutritionist from Delhi. Join my programs to transform your body and mind!',
      },
    });
    console.log('   ✅ @fitnessguru — Fitness Coach, Delhi (Active Pro)');

    const foodie = await User.create({
      fullName: 'Neha Gupta',
      email: 'neha@example.com',
      phone: '9876543213',
      username: 'foodie.delhi',
      password: USER_PASSWORD,
      bio: 'Food Blogger 🍕 | Delhi | Exploring every gali ka khaana 😋',
      category: 'Food',
      city: 'Delhi',
      state: 'Delhi',
      isVerified: true,
      isPro: false,
      subscriptionStatus: 'inactive',
      theme: {
        backgroundColor: '#ff6b35',
        cardColor: '#ffffff',
        textColor: '#333333',
        buttonColor: '#ff6b35',
        buttonTextColor: '#ffffff',
        fontFamily: 'Nunito',
        buttonStyle: 'pill',
        backgroundType: 'gradient',
        gradientFrom: '#ff6b35',
        gradientTo: '#f72585',
      },
      links: [
        { title: 'Food Reviews on Instagram 📸', url: 'https://instagram.com/foodie.delhi', platform: 'Instagram Post', isActive: true, clickCount: 0, order: 0 },
        { title: 'YouTube Food Vlogs 🎬', url: 'https://youtube.com/@foodiedelhi', platform: 'YouTube Channel', isActive: true, clickCount: 0, order: 1 },
        { title: 'My Zomato Reviews 🍽️', url: 'https://zomato.com/foodiedelhi', platform: 'Website', isActive: true, clickCount: 0, order: 2 },
        { title: 'Swiggy Food Blog 📝', url: 'https://swiggy.com/blog/foodiedelhi', platform: 'Blog Post', isActive: true, clickCount: 0, order: 3 },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/foodie.delhi',
        youtube: 'https://youtube.com/@foodiedelhi',
        twitter: 'https://twitter.com/foodiedelhi',
        whatsapp: 'https://wa.me/919876543213',
      },
      analytics: { totalViews: 0, totalClicks: 0, viewsByDate: [], clicksByDate: [], topReferrers: [], visitorLocations: [] },
      seoSettings: {
        metaTitle: 'Neha Gupta — Delhi Food Blogger',
        metaDescription: 'Food blogger from Delhi exploring the best street food and restaurants.',
      },
    });
    console.log('   ✅ @foodie.delhi — Food Blogger, Delhi (FREE)');

    const comedy = await User.create({
      fullName: 'Vikram Rao',
      email: 'vikram@example.com',
      phone: '9876543214',
      username: 'comedy.king',
      password: USER_PASSWORD,
      bio: 'Comedy Creator 😂 | Hyderabad | Making India laugh one reel at a time 🤣',
      category: 'Comedy',
      city: 'Hyderabad',
      state: 'Telangana',
      isVerified: true,
      isPro: false,
      subscriptionStatus: 'expired',
      subscriptionStartDate: daysAgo(35),
      subscriptionEndDate: daysAgo(5),
      theme: {
        backgroundColor: '#240046',
        cardColor: '#3c096c',
        textColor: '#e0aaff',
        buttonColor: '#ffd700',
        buttonTextColor: '#240046',
        fontFamily: 'Poppins',
        buttonStyle: 'shadow',
        backgroundType: 'solid',
        gradientFrom: '#240046',
        gradientTo: '#3c096c',
      },
      links: [
        { title: 'Comedy Videos 😂', url: 'https://youtube.com/@comedyking', platform: 'YouTube Channel', isActive: true, clickCount: 567, order: 0 },
        { title: 'Instagram Reels 🎭', url: 'https://instagram.com/comedy.king', platform: 'Instagram Reel', isActive: true, clickCount: 445, order: 1 },
        { title: 'Moj Comedy 🤣', url: 'https://mojapp.in/@comedyking', platform: 'Moj', isActive: true, clickCount: 234, order: 2 },
      ],
      socialLinks: {
        instagram: 'https://instagram.com/comedy.king',
        youtube: 'https://youtube.com/@comedyking',
        twitter: 'https://twitter.com/comedyking',
        moj: 'https://mojapp.in/@comedyking',
        sharechat: 'https://sharechat.com/comedyking',
        joshapp: 'https://share.myjosh.in/comedyking',
      },
      analytics: generateAnalyticsData(30, [60, 300], [25, 130]),
      seoSettings: {
        metaTitle: 'Comedy King — Vikram Rao',
        metaDescription: 'Comedy creator from Hyderabad making India laugh.',
      },
    });
    console.log('   ✅ @comedy.king — Comedy Creator, Hyderabad (EXPIRED)');

    // ——— Payment Records ———————————————————————————————————
    console.log('\n💳 Creating payment records...');

    const proUsers = [priya, techraj, fitnessguru];
    let paymentCount = 0;

    for (const user of proUsers) {
      paymentCount++;
      const payment = await Payment.create({
        userId: user._id,
        razorpayOrderId: `order_demo_${user.username}_${Date.now()}`,
        razorpayPaymentId: `pay_demo_${user.username}_${Date.now()}`,
        razorpaySignature: `demo_signature_${user.username}`,
        amount: 4900,
        currency: 'INR',
        status: 'captured',
        method: ['upi', 'card', 'netbanking'][Math.floor(Math.random() * 3)],
        planType: 'monthly',
        invoiceNumber: `LV-${new Date().getFullYear()}-${String(paymentCount).padStart(5, '0')}`,
      });
      console.log(`   ✅ Payment for @${user.username}: ${payment.invoiceNumber}`);
    }

    paymentCount++;
    const comedyPayment = await Payment.create({
      userId: comedy._id,
      razorpayOrderId: `order_demo_comedy_${Date.now()}`,
      razorpayPaymentId: `pay_demo_comedy_${Date.now()}`,
      razorpaySignature: 'demo_signature_comedy',
      amount: 4900,
      currency: 'INR',
      status: 'captured',
      method: 'upi',
      planType: 'monthly',
      invoiceNumber: `LV-${new Date().getFullYear()}-${String(paymentCount).padStart(5, '0')}`,
      createdAt: daysAgo(35),
    });
    console.log(`   ✅ Payment for @comedy.king: ${comedyPayment.invoiceNumber} (35 days ago)`);

    // ——— Support Tickets ———————————————————————————————————
    console.log('\n🎫 Creating sample support tickets...');

    await Contact.create([
      {
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        subject: 'Payment issue — amount deducted but Pro not activated',
        message: 'Hi team, I made a payment of ₹49 via UPI but my Pro plan is not showing as active. My transaction ID is pay_test_12345. Please help!',
        status: 'open',
      },
      {
        name: 'Sneha Patel',
        email: 'sneha@example.com',
        subject: 'Feature request — Custom domain support',
        message: 'Hi! I love LinkVerse and would like to use my custom domain. Is this feature planned?',
        status: 'open',
      },
      {
        name: 'Karan Mehta',
        email: 'karan@example.com',
        subject: 'How to change my username?',
        message: 'I signed up with username karan123 but want to change it to karan.mehta. How can I do this?',
        status: 'resolved',
        resolvedAt: daysAgo(2),
      },
    ]);
    console.log('   ✅ 3 support tickets created\n');

    // ——— Summary ———————————————————————————————————————————
    console.log('===========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('===========================================\n');
    console.log('🔑 Admin: admin@linkverse.com / Admin@123');
    console.log('👥 Users: all use Password@123');
    console.log('   @priya.fashion  — Active Pro');
    console.log('   @techraj        — Active Pro');
    console.log('   @fitnessguru    — Active Pro (expiring soon)');
    console.log('   @foodie.delhi   — Free User');
    console.log('   @comedy.king    — Expired Pro\n');
  } catch (error) {
    console.error('\n❌ Seed Error:', error.message);
    if (process.env.NODE_ENV === 'development') console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();