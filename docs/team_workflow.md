# Team Workflow & Guidelines - Board Game Web Application

## 👥 Team Structure

### Roles & Responsibilities

#### Team Lead (1 người)
**Trách nhiệm:**
- Quản lý tiến độ dự án
- Phân công công việc
- Review code của tất cả thành viên
- Tích hợp các module
- Giải quyết conflict
- Báo cáo tiến độ
- Đảm bảo chất lượng code

**Kỹ năng yêu cầu:**
- Hiểu rõ cả Frontend và Backend
- Kỹ năng quản lý dự án
- Kỹ năng giao tiếp tốt

---

#### Backend Team (2 người)

##### Backend Developer 1: Authentication & User Management
**Trách nhiệm:**
- Authentication system (JWT)
- User registration/login
- User profile management
- Password hashing & security
- Middleware authentication

**Deliverables:**
- `/api/auth/*` endpoints
- `/api/users/*` endpoints
- Auth middleware
- User model & migrations

---

##### Backend Developer 2: Game Logic & Sessions
**Trách nhiệm:**
- Game sessions API
- Game state management
- Save/Load functionality
- Ranking system
- Game statistics

**Deliverables:**
- `/api/games/*` endpoints
- `/api/rankings/*` endpoints
- Game models & migrations
- Ranking calculations

---

##### Backend Developer 3: Social Features & Admin
**Trách nhiệm:**
- Friends system
- Messaging system
- Achievements system
- Admin dashboard API
- Database seeding

**Deliverables:**
- `/api/friends/*` endpoints
- `/api/messages/*` endpoints
- `/api/achievements/*` endpoints
- `/api/admin/*` endpoints
- Seed data

---

#### Frontend Team (2 người)

##### Frontend Developer 1: Core UI & Authentication
**Trách nhiệm:**
- Project setup (Vite + React)
- Routing structure
- Authentication UI (Login/Register)
- Layout components
- Dark mode implementation
- Protected routes

**Deliverables:**
- App structure
- Auth pages
- Layout components
- Theme system
- Routing setup

---

##### Frontend Developer 2: Game Board & Logic
**Trách nhiệm:**
- Game board component
- Game logic implementation (5+ games)
- Computer AI
- Game controls
- Save/Load UI
- Game statistics display

**Deliverables:**
- GameBoard component
- Game logic utilities
- Game pages
- Game controls


## 🔄 Development Workflow

### 1. Git Workflow

#### Branch Strategy
```
main (production)
  ├── develop (integration)
  │   ├── feature/auth-backend
  │   ├── feature/auth-frontend
  │   ├── feature/game-logic
  │   ├── feature/user-management
  │   └── ...
  └── hotfix/critical-bug
```

#### Branch Naming Convention
- `feature/[feature-name]` - Tính năng mới
- `bugfix/[bug-name]` - Sửa bug
- `hotfix/[issue-name]` - Sửa lỗi khẩn cấp
- `refactor/[area-name]` - Refactor code
- `docs/[doc-name]` - Cập nhật documentation

**Ví dụ:**
```
feature/auth-backend
feature/game-board-ui
bugfix/login-validation
hotfix/database-connection
```

---

### 2. Commit Message Convention

#### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Cập nhật documentation
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

#### Examples
```bash
feat(auth): implement JWT authentication

- Add login endpoint
- Add register endpoint
- Implement JWT middleware

Closes #12
```

```bash
fix(game): fix win condition check in Caro5

The previous implementation didn't check diagonal wins correctly.
Now it properly checks all 4 directions.

Fixes #45
```

```bash
docs(api): update API specification for game endpoints

Added detailed request/response examples for all game endpoints.
```

---

### 3. Pull Request Process

#### Creating PR
1. **Tạo branch từ `develop`**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature
   ```

2. **Develop & commit**
   ```bash
   git add .
   git commit -m "feat(scope): your message"
   ```

3. **Push to remote**
   ```bash
   git push origin feature/your-feature
   ```

4. **Tạo Pull Request trên GitHub**
   - Title: Mô tả ngắn gọn
   - Description: Chi tiết thay đổi
   - Assign reviewers
   - Link related issues

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Tested locally
- [ ] All tests pass
- [ ] No console errors

## Screenshots (if applicable)
[Add screenshots]

## Related Issues
Closes #[issue number]
```

#### Review Process
1. **Code Review** (ít nhất 1 người, Team Lead bắt buộc)
   - Check code quality
   - Check logic
   - Check naming conventions
   - Check comments
   - Suggest improvements

2. **Testing**
   - Reviewer test locally
   - Check for bugs
   - Verify functionality

3. **Approval & Merge**
   - Sau khi approve, Team Lead merge vào `develop`
   - Delete branch sau khi merge

---

### 4. Code Review Checklist

#### General
- [ ] Code follows project structure
- [ ] No console.log() or debug code
- [ ] No commented-out code
- [ ] Proper error handling
- [ ] No hardcoded values (use .env)

#### Backend
- [ ] API follows RESTful conventions
- [ ] Proper HTTP status codes
- [ ] Input validation
- [ ] Authentication/Authorization check
- [ ] Database queries optimized
- [ ] No SQL injection vulnerabilities
- [ ] Proper error messages

#### Frontend
- [ ] Components are reusable
- [ ] Proper state management
- [ ] No prop drilling
- [ ] Responsive design
- [ ] Accessibility (a11y)
- [ ] Loading states
- [ ] Error handling
- [ ] Clean UI/UX

---

## 📅 Sprint Planning

### Sprint Duration
- **2 weeks per sprint**
- **Total: 5-6 sprints**

### Sprint Structure

#### Sprint 1: Setup & Foundation (Week 1-2)
**Backend:**
- [ ] Project setup
- [ ] Database design & migrations
- [ ] Authentication API
- [ ] User API

**Frontend:**
- [ ] Project setup
- [ ] Routing structure
- [ ] Authentication UI
- [ ] Layout components

**Deliverable:** Working authentication system

---

#### Sprint 2: Core Game Features (Week 3-4)
**Backend:**
- [ ] Game sessions API
- [ ] Save/Load API
- [ ] Basic ranking API

**Frontend:**
- [ ] Game board component
- [ ] Implement 2 games (Caro5, TicTacToe)
- [ ] Game controls
- [ ] Save/Load UI

**Deliverable:** 2 playable games with save/load

---

#### Sprint 3: More Games & Features (Week 5-6)
**Backend:**
- [ ] Complete ranking system
- [ ] Achievements API
- [ ] Game statistics

**Frontend:**
- [ ] Implement 3 more games
- [ ] Ranking pages
- [ ] Game statistics display

**Deliverable:** 5+ playable games, ranking system

---

#### Sprint 4: Social Features (Week 7-8)
**Backend:**
- [ ] Friends API
- [ ] Messages API
- [ ] Notifications

**Frontend:**
- [ ] Friends management UI
- [ ] Messaging UI
- [ ] Achievements display
- [ ] Profile pages

**Deliverable:** Complete social features

---

#### Sprint 5: Admin & Polish (Week 9-10)
**Backend:**
- [ ] Admin API
- [ ] Statistics API
- [ ] Data seeding

**Frontend:**
- [ ] Admin dashboard
- [ ] User management
- [ ] Game management
- [ ] UI/UX improvements

**Deliverable:** Complete admin system

---

#### Sprint 6: Testing & Deployment (Week 11-12)
**All:**
- [ ] Bug fixes
- [ ] Testing
- [ ] Documentation
- [ ] Deployment
- [ ] Final presentation

**Deliverable:** Production-ready application

---

## 🤝 Communication

### Daily Standup (Optional but Recommended)
**Format:**
- What did I do yesterday?
- What will I do today?
- Any blockers?

**Duration:** 10-15 minutes
**Platform:** Discord/Telegram/Zoom

---

### Weekly Meeting
**Agenda:**
- Review sprint progress
- Demo completed features
- Discuss blockers
- Plan next week

**Duration:** 30-60 minutes
**Platform:** Zoom/Google Meet

---

### Communication Channels

#### Discord/Telegram
- **#general**: Thảo luận chung
- **#backend**: Backend discussions
- **#frontend**: Frontend discussions
- **#bugs**: Bug reports
- **#random**: Off-topic

#### GitHub
- **Issues**: Track tasks & bugs
- **Pull Requests**: Code review
- **Discussions**: Technical discussions
- **Wiki**: Documentation

---

## 📊 Task Management

### GitHub Issues

#### Issue Template
```markdown
## Description
Clear description of the task/bug

## Type
- [ ] Feature
- [ ] Bug
- [ ] Enhancement
- [ ] Documentation

## Priority
- [ ] High
- [ ] Medium
- [ ] Low

## Assignee
@username

## Estimated Time
X hours/days

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related
Related to #[issue number]
```

#### Labels
- `backend` - Backend task
- `frontend` - Frontend task
- `bug` - Bug fix
- `feature` - New feature
- `documentation` - Documentation
- `high-priority` - High priority
- `in-progress` - Currently working
- `review-needed` - Needs review
- `blocked` - Blocked by something

---

### GitHub Projects (Kanban Board)

**Columns:**
1. **Backlog** - Chưa bắt đầu
2. **To Do** - Sẵn sàng làm
3. **In Progress** - Đang làm
4. **Review** - Đang review
5. **Done** - Hoàn thành

---

## 📝 Documentation Standards

### Code Comments

#### Backend
```javascript
/**
 * Authenticate user and return JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} User data and token
 */
async function login(req, res) {
  // Implementation
}
```

#### Frontend
```javascript
/**
 * GameBoard component
 * @param {string} gameType - Type of game (caro5, caro4, etc.)
 * @param {Object} boardSize - Board dimensions {rows, cols}
 * @param {Function} onGameEnd - Callback when game ends
 */
function GameBoard({ gameType, boardSize, onGameEnd }) {
  // Implementation
}
```

---

### README Files

#### Project README
```markdown
# Board Game Web Application

## Description
Brief project description

## Tech Stack
- Frontend: React + Vite
- Backend: Express + Knex + Supabase

## Setup
See [DEVELOPMENT_SETUP.md](./docs/DEVELOPMENT_SETUP.md)

## Team
- Team Lead: [Name]
- Backend: [Names]
- Frontend: [Names]

## License
MIT
```

#### Module README
```markdown
# Module Name

## Purpose
What this module does

## Usage
How to use this module

## API
Available functions/components

## Examples
Code examples
```

---

## ✅ Definition of Done

### Feature is Done when:
- [ ] Code is written and follows conventions
- [ ] Code is reviewed and approved
- [ ] Tests pass (if applicable)
- [ ] Documentation is updated
- [ ] No console errors
- [ ] Works on all supported browsers
- [ ] Merged to develop branch
- [ ] Related issue is closed

---

## 🚨 Conflict Resolution

### Code Conflicts
1. Communicate with team member
2. Discuss the best approach
3. Team Lead makes final decision if needed

### Merge Conflicts
1. Pull latest develop
2. Resolve conflicts locally
3. Test thoroughly
4. Push resolved version

### Technical Disagreements
1. Present both approaches
2. Discuss pros/cons
3. Team vote or Team Lead decides
4. Document decision

---

## 🎯 Best Practices

### General
- ✅ Write clean, readable code
- ✅ Follow naming conventions
- ✅ Keep functions small and focused
- ✅ Don't repeat yourself (DRY)
- ✅ Comment complex logic
- ✅ Handle errors properly
- ✅ Use meaningful variable names

### Backend
- ✅ Validate all inputs
- ✅ Use parameterized queries
- ✅ Return consistent response format
- ✅ Use proper HTTP status codes
- ✅ Log errors properly
- ✅ Keep controllers thin
- ✅ Business logic in services

### Frontend
- ✅ Component-based architecture
- ✅ Reusable components
- ✅ Proper state management
- ✅ Handle loading states
- ✅ Handle error states
- ✅ Responsive design
- ✅ Accessibility

---

## 📚 Resources

### Learning
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Knex.js Documentation](http://knexjs.org)
- [Supabase Docs](https://supabase.com/docs)

### Tools
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [Markdown Guide](https://www.markdownguide.org)
- [REST API Best Practices](https://restfulapi.net)

---

## 🎓 Onboarding New Members

### Day 1
1. Clone repository
2. Setup development environment
3. Read all documentation
4. Run project locally
5. Join communication channels

### Week 1
1. Fix a small bug
2. Add a small feature
3. Get familiar with codebase
4. Attend meetings

### Week 2+
1. Take on larger tasks
2. Participate in code reviews
3. Contribute to discussions
