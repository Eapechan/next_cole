# NextCoal Initiative - Carbon Management Platform

A comprehensive carbon neutrality platform designed specifically for Indian coal mines. Track emissions, manage carbon offsets, and achieve net-zero goals with AI-powered insights and regulatory compliance tools.

## 🌱 Features

- **Real-time Emission Tracking**: Monitor CO2 emissions from various mining activities
- **Carbon Sink Management**: Track and manage carbon offset projects
- **AI-Powered Insights**: Get intelligent recommendations for emission reduction
- **Regulatory Compliance**: Ensure adherence to Indian environmental standards
- **Multi-User Support**: Role-based access for mine operators, regulators, and administrators
- **Comprehensive Reporting**: Generate detailed PDF reports for compliance and analysis
- **Dashboard Analytics**: Visualize emission trends and reduction progress
- **Land Area Calculator**: Advanced carbon offset calculation with location mapping

## 🗺️ Google Maps Integration

The platform includes enhanced Google Maps integration for the Land Area Calculator:

### Features

- **Automatic coordinate extraction** from Google Maps URLs
- **Multiple URL format support** (standard, search, place, short URLs)
- **Backend service** for expanding shortened URLs
- **Interactive map preview** with embedded Google Maps
- **Manual coordinate entry** with validation
- **Location validation** and error handling

### Quick Start for Maps Service

1. **Start the backend service** (optional, for short URLs):

   ```bash
   # Windows
   start-maps-service.bat

   # Or manually
   cd maps-expander
   npm install
   node index.js
   ```

2. **Test the integration**:
   - Go to Admin Panel → "Google Maps Test" tab
   - Try the quick test URLs
   - Verify backend service status

### Usage in Land Area Calculator

1. Navigate to "Carbon Sink" → "Land Area Calculator"
2. **Method 1**: Paste Google Maps URL with coordinates
3. **Method 2**: Enter coordinates manually
4. **Method 3**: Use "Paste Coordinates" button
5. View map preview to confirm location

### Supported URL Formats

```
https://www.google.com/maps/@23.5937,78.9629,15z
https://www.google.com/maps?q=28.6139,77.2090
https://www.google.com/maps/place/19.0760,72.8777
23.5937,78.9629
```

For detailed instructions, see [GOOGLE_MAPS_INTEGRATION_GUIDE.md](./GOOGLE_MAPS_INTEGRATION_GUIDE.md).

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern web browser

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-org/nextcoal-initiative.git
cd nextcoal-initiative
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 👥 Demo Accounts

| Role          | Email                                  | Password      |
| ------------- | -------------------------------------- | ------------- |
| Mine Operator | `operator@nextcoal-initiative.gov.in`  | `password123` |
| Regulator     | `regulator@nextcoal-initiative.gov.in` | `password123` |
| Admin         | `admin@nextcoal-initiative.gov.in`     | `password123` |

## 🏗️ Architecture

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **React Router** for navigation
- **React Query** for data fetching

### State Management

- **React Context** for global state
- **Local Storage** for data persistence
- **User-specific data isolation**

### Key Components

- **Dashboard**: Main overview with emission metrics
- **Emission Input**: Add and manage emission entries
- **Carbon Sink**: Track carbon offset projects
- **Strategy**: Plan and monitor reduction strategies
- **Reports**: Generate compliance reports
- **Admin Panel**: User and system management

## 📊 Data Structure

### Local Storage Keys

- `nextcoal_user`: User authentication data
- `nextcoal_emissions_{userId}`: Emission entries
- `nextcoal_carbon_sinks_{userId}`: Carbon sink projects
- `nextcoal_strategies_{userId}`: Reduction strategies
- `nextcoal_mock_users`: User management data

### Emission Entry

```typescript
interface EmissionEntry {
  id: string;
  date: string;
  activityType: string;
  quantity: number;
  unit: string;
  co2e: number;
  location?: string;
  notes?: string;
  userId: string;
  mineId?: string;
  createdAt: string;
}
```

## 🎯 User Roles

### Mine Operator

- Add and manage emission entries
- Track carbon sink projects
- View compliance metrics
- Generate reports

### Regulator

- Monitor multiple mines
- Review compliance data
- Generate regulatory reports
- Access admin features

### Administrator

- Manage user accounts
- System configuration
- Data analytics
- Full platform access

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Feature Flags

Configure features in `src/lib/config.ts`:

```typescript
features: {
  aiEnabled: true,
  notificationsEnabled: true,
  exportEnabled: true,
  aiInsights: true,
  realTimeTracking: true,
  complianceReporting: true,
  carbonOffsetting: true,
}
```

## 📈 Usage

### Adding Emissions

1. Navigate to "Emissions" in the sidebar
2. Click "Add New Emission"
3. Fill in activity details and quantities
4. System automatically calculates CO2 equivalent

### Managing Carbon Sinks

1. Go to "Carbon Sink" section
2. Add offset projects (tree planting, renewable energy, etc.)
3. Track progress and impact

### Generating Reports

1. Visit "Reports" page
2. Review summary statistics
3. Click "Export PDF Report"
4. Download compliance-ready document

## 🧪 Testing

### User Registration Testing

See [DEMO_USER_REGISTRATION.md](./DEMO_USER_REGISTRATION.md) for detailed testing instructions.

### Manual Testing

1. Create new user accounts
2. Verify empty dashboard for new users
3. Test data isolation between users
4. Validate PDF report generation
5. Check admin panel functionality

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings
3. Deploy automatically on push to main branch

### Environment Setup

- Set production environment variables
- Configure API endpoints
- Update domain settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Email**: support@nextcoal-initiative.gov.in
- **Documentation**: [Wiki](https://github.com/your-org/nextcoal-initiative/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/nextcoal-initiative/issues)

## 🙏 Acknowledgments

- Indian Ministry of Coal for regulatory guidance
- IPCC standards for emission calculations
- Open source community for tools and libraries
- Environmental experts for domain knowledge

---

**NextCoal Initiative** - Empowering coal mines for carbon neutrality 🌱
"# NextCoal-Initiative"
