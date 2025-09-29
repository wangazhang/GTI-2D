---
allowed-tools: Bash, Read, Write, LS, Task
---

# UI Design

Launch UI design process with senior UI designer and frontend developer collaboration.

## Usage
```
/pm:ui-design <feature_name>
```

## Required Rules

**IMPORTANT:** Before executing this command, read and follow:
- `.claude/rules/datetime.md` - For getting real current date/time

## Preflight Checklist

Before proceeding, complete these validation steps.
Do not bother the user with preflight checks progress ("I'm not going to ..."). Just do them and move on.

### Validation Steps
1. **Verify <feature_name> was provided as a parameter:**
   - If not, tell user: "❌ <feature_name> was not provided as parameter. Please run: /pm:ui-design <feature_name>"
   - Stop execution if <feature_name> was not provided

2. **Verify epic exists:**
   - Check if `.claude/epics/$ARGUMENTS/epic.md` exists
   - If not found, tell user: "❌ Epic not found: $ARGUMENTS. First create it with: /pm:prd-parse $ARGUMENTS"
   - Stop execution if epic doesn't exist

3. **Check for existing UI designs:**
   - Check if `UI/$ARGUMENTS/` directory already exists
   - If it exists, ask user: "⚠️ UI designs for '$ARGUMENTS' already exist. Do you want to overwrite them? (yes/no)"
   - Only proceed with explicit 'yes' confirmation
   - If user says no, suggest: "View existing designs in: UI/$ARGUMENTS/"

4. **Verify UI directory structure:**
   - Ensure `UI/` directory exists at project root level (same as .claude/)
   - If not, create it first
   - If unable to create, tell user: "❌ Cannot create UI directory. Please check permissions."

5. **Validate epic content:**
   - Verify epic has valid frontmatter and technical requirements
   - If incomplete, tell user: "❌ Epic is incomplete. Please ensure epic has proper content before designing UI."

## Instructions

You are orchestrating a comprehensive UI design process for: **$ARGUMENTS**

This process involves two specialized agents working in collaboration:
1. **Senior UI Designer** (15+ years experience)
2. **Senior Frontend Developer** (15+ years experience)

### Phase 1: PRD Analysis and Design Strategy

#### 1.1 Load Project Context
- Read the PRD from `.claude/prds/$ARGUMENTS.md`
- Read the Epic from `.claude/epics/$ARGUMENTS/epic.md`
- Understand the technical requirements and constraints
- Extract all functional requirements and user stories

#### 1.2 Launch UI Designer Agent
Spawn the UI Designer agent to analyze and strategize:

```yaml
Task:
  description: "UI Design Strategy for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    You are a senior UI designer with 15+ years of experience. Your role is to:

    1. **Deep Analysis**: Read the PRD (.claude/prds/$ARGUMENTS.md) and Epic (.claude/epics/$ARGUMENTS/epic.md)
    2. **Design Strategy**: Based on the requirements, provide 3-4 different UI design style options
    3. **User Research**: Ask the user targeted questions to understand their preferences
    4. **Style Selection**: Help user choose the best design direction

    IMPORTANT:
    - Ask questions suitable for non-technical users
    - Provide clear explanations for each design style
    - Focus on business goals and user experience
    - Reference the UI Designer agent capabilities from .claude/agents/ui-designer.md

    Your output should include:
    - Analysis summary of the PRD requirements
    - 3-4 design style options with pros/cons
    - Key questions for the user
    - Recommended approach based on project goals
```

### Phase 2: User Requirements Collection

Based on the UI Designer's analysis, collect specific user preferences:

#### 2.1 Design Style Preferences
Ask user to choose from the provided design style options:
- Modern minimalist style
- Warm and friendly style
- Technology/futuristic style
- Classic business style

#### 2.2 Additional Requirements
Collect these details from the user:
- **Target Platform**: PC only / Mobile only / Responsive (both)
- **Color Preferences**: Any specific brand colors or preferences
- **User Demographics**: Primary user age group and tech proficiency
- **Use Cases**: Primary usage scenarios and environments
- **Performance Requirements**: Any specific performance or loading requirements

### Phase 3: UI Directory Structure Creation

Create the complete UI directory structure:

```
UI/
├── $ARGUMENTS/                    # Feature-specific directory
│   ├── design-system/             # Design system files
│   │   ├── design-guide.html      # Complete design guide
│   │   ├── colors.html           # Color palette showcase
│   │   ├── typography.html       # Typography examples
│   │   └── components.html       # Component library
│   ├── pages/                     # Page designs
│   │   ├── auth/                 # Authentication pages
│   │   ├── main/                 # Main application pages
│   │   ├── dashboard/            # Dashboard pages
│   │   └── settings/             # Settings pages
│   ├── components/                # Reusable components
│   │   ├── navigation/           # Navigation components
│   │   ├── forms/                # Form components
│   │   ├── data-display/         # Data display components
│   │   └── feedback/             # Feedback components
│   ├── assets/                    # Static assets
│   │   ├── styles/               # CSS files
│   │   ├── scripts/              # JavaScript files
│   │   └── images/               # Image placeholders
│   └── index.html                # Main navigation page
```

### Phase 4: Design System Creation

#### 4.1 Spawn Frontend Developer for Design System
Create the foundational design system:

```yaml
Task:
  description: "Create Design System for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    You are a senior frontend developer with 15+ years of experience. Create a comprehensive design system:

    1. **Technology Stack**: HTML + Tailwind CSS + Vanilla JavaScript
    2. **Design Guide**: Create UI/$ARGUMENTS/design-system/design-guide.html
       - Complete design philosophy and principles
       - Color palette with Tailwind classes
       - Typography scale and examples
       - Spacing and layout guidelines
       - Component specifications

    3. **Implementation Requirements**:
       - Use Tailwind CSS for all styling
       - Responsive design (mobile-first approach)
       - Modern CSS animations and transitions
       - Accessible design (WCAG compliance)
       - Use Unsplash images with appropriate keywords

    4. **Style Configuration**:
       - Based on user's selected design style: {USER_SELECTED_STYLE}
       - Target platform: {USER_PLATFORM_CHOICE}
       - Color preferences: {USER_COLOR_PREFERENCES}

    Reference the Frontend Developer capabilities from .claude/agents/frontend-developer.md

    Output: Complete design system files with live examples
```

### Phase 5: Page Design and Implementation

#### 5.1 Analyze Epic for Page Requirements
Extract all required pages from the epic's requirements:
- Authentication flows (login, signup, forgot password)
- Main application pages (dashboard, core features)
- Settings and configuration pages
- Error and edge case pages

#### 5.2 Parallel Page Creation Strategy
Based on page count and dependencies:

**Small Project (< 8 pages)**: Create sequentially for simplicity

**Medium Project (8-15 pages)**:
- Batch into 3-4 groups based on functionality
- Spawn parallel agents for each batch
- Ensure shared components are created first

**Large Project (> 15 pages)**:
- Analyze dependencies and group by priority
- Launch up to 4 parallel agents (user requirement)
- Create core pages first, then secondary pages

#### 5.3 Parallel Page Creation Example
```yaml
# Agent 1: Authentication & Landing
Task:
  description: "Create Auth Pages for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    Create authentication and landing pages:
    - UI/$ARGUMENTS/pages/auth/login.html
    - UI/$ARGUMENTS/pages/auth/signup.html
    - UI/$ARGUMENTS/pages/auth/forgot-password.html
    - UI/$ARGUMENTS/index.html (main navigation)

    Requirements: {DESIGN_REQUIREMENTS}
    Use design system from: UI/$ARGUMENTS/design-system/

# Agent 2: Core Application Pages
Task:
  description: "Create Main App Pages for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    Create main application pages:
    - UI/$ARGUMENTS/pages/main/dashboard.html
    - UI/$ARGUMENTS/pages/main/[feature-specific pages based on epic]

    Requirements: {DESIGN_REQUIREMENTS}
    Use design system from: UI/$ARGUMENTS/design-system/

# Agent 3: Settings & Configuration
Task:
  description: "Create Settings Pages for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    Create settings and configuration pages:
    - UI/$ARGUMENTS/pages/settings/profile.html
    - UI/$ARGUMENTS/pages/settings/preferences.html
    - UI/$ARGUMENTS/pages/settings/account.html

    Requirements: {DESIGN_REQUIREMENTS}
    Use design system from: UI/$ARGUMENTS/design-system/

# Agent 4: Components & Utilities
Task:
  description: "Create Reusable Components for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    Create reusable components:
    - Navigation components
    - Form components
    - Data display components
    - Modal and overlay components

    Requirements: {DESIGN_REQUIREMENTS}
    Use design system from: UI/$ARGUMENTS/design-system/
```

### Phase 6: Integration and Navigation

#### 6.1 Page Linking System
Ensure all pages are properly connected:
- Implement JavaScript-based SPA routing
- Add navigation menus and breadcrumbs
- Create smooth page transitions
- Handle browser history and deep linking

#### 6.2 Component Integration
- Ensure shared components work across all pages
- Implement consistent state management
- Add proper event handling and data flow

### Phase 7: Quality Assurance

#### 7.1 Navigation Testing
Create a testing agent to verify:
```yaml
Task:
  description: "Test UI Navigation for $ARGUMENTS"
  subagent_type: "general-purpose"
  prompt: |
    Test the complete UI implementation:

    1. **Navigation Testing**:
       - Verify all page links work correctly
       - Test browser back/forward functionality
       - Check responsive navigation on mobile

    2. **Cross-Platform Testing**:
       - Test on mobile viewport (if responsive required)
       - Test on tablet viewport (if responsive required)
       - Test on desktop viewport
       - Verify all breakpoints work properly

    3. **Component Testing**:
       - Test all interactive components
       - Verify form submissions and validations
       - Check animation and transition smoothness

    4. **Image and Asset Testing**:
       - Verify all Unsplash images load correctly
       - Check image optimization and lazy loading
       - Test asset caching and performance

    Output: Detailed test report with any issues found
```

#### 7.2 Performance Optimization
- Optimize images and assets
- Minify CSS and JavaScript
- Implement lazy loading
- Add loading states and error handling

### Phase 8: Documentation and Handoff

#### 8.1 Create Implementation Guide
Generate comprehensive documentation:
- Component usage examples
- Page structure documentation
- Integration instructions for developers
- Design decision rationale

#### 8.2 Update Epic with UI Information
Add UI completion information to the epic:
```markdown
## UI Design Completed
- Design System: UI/$ARGUMENTS/design-system/
- Total Pages: {COUNT}
- Navigation Type: {SPA/Multi-page}
- Platform Support: {PC/Mobile/Responsive}
- Component Library: {COUNT} components
- Design Style: {SELECTED_STYLE}

## UI Integration Notes
- All pages use shared design system
- Responsive breakpoints: {BREAKPOINT_INFO}
- Image sources: Unsplash with optimization
- JavaScript: Vanilla JS with modern features
- CSS Framework: Tailwind CSS

## Next Steps
Ready for epic decomposition with UI implementation tasks included.
```

## Post-Creation Actions

After successfully completing the UI design process:

1. **Confirmation**: "✅ UI design completed for: $ARGUMENTS"

2. **Summary Display**:
   - Total pages created: {COUNT}
   - Design style used: {STYLE}
   - Platform support: {PLATFORMS}
   - Navigation testing: {PASS/FAIL}

3. **Next Steps**: "Ready to decompose epic with UI implementation tasks? Run: /pm:epic-decompose $ARGUMENTS"

4. **Integration Note**: "The epic decomposition will now include tasks for implementing these UI designs in the target technology stack."

## Error Recovery

If any step fails:
- Clearly identify which phase failed
- Provide specific recovery instructions
- Offer to restart from the failed phase
- Never leave the UI directory in an inconsistent state

## Quality Standards

Ensure all deliverables meet these standards:
- **Design Quality**: High-fidelity, professional appearance
- **Code Quality**: Clean, maintainable, well-commented code
- **Performance**: Fast loading, smooth animations
- **Accessibility**: WCAG 2.1 AA compliance
- **Responsiveness**: Perfect adaptation across all target devices
- **Browser Support**: Modern browsers (Chrome 90+, Firefox 90+, Safari 14+, Edge 90+)

The UI design process for "$ARGUMENTS" will provide a complete, production-ready UI foundation that developers can implement in any technology stack while maintaining design fidelity and user experience excellence.