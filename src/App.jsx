import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Psychologists from './pages/Psychologists/Psychologists';
import Alphabet from './pages/Alphabet/Alphabet';
import Students from './pages/Students/Students';
import Survey from './pages/Survey/Survey';
import News from './pages/News/News';
import NewsDetail from './pages/NewsDetail/NewsDetail';
import Contacts from './pages/Contacts/Contacts';
import AdminPage from './pages/Admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="psychologists" element={<Psychologists />} />
            <Route path="alphabet" element={<Alphabet />} />
            <Route path="students" element={<Students />} />
            <Route path="survey" element={<Survey />} />
            <Route path="news" element={<News />} />
            <Route path="news/:id" element={<NewsDetail />} />
            <Route path="contacts" element={<Contacts />} />
          </Route>
          {/* Админ-страница без Layout (без Header/Footer) */}
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;

