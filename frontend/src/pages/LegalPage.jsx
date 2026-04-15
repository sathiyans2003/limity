import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const POLICY_CONTENT = {
  'privacy': {
    title: 'Privacy Policy',
    content: `
      At Limitly, accessible from limitly.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Limitly and how we use it.

      ### 1. Log Files
      Limitly follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.

      ### 2. Cookies and Web Beacons
      Like any other website, Limitly uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.

      ### 3. Our Advertising Partners
      Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data.

      ### 4. Consent
      By using our website, you hereby consent to our Privacy Policy and agree to its terms.
    `
  },
  'terms': {
    title: 'Terms of Service',
    content: `
      Welcome to Limitly! These terms and conditions outline the rules and regulations for the use of Limitly's Website.

      ### 1. Terms
      By accessing this website, we assume you accept these terms and conditions. Do not continue to use Limitly if you do not agree to take all of the terms and conditions stated on this page.

      ### 2. License
      Unless otherwise stated, Limitly and/or its licensors own the intellectual property rights for all material on Limitly. All intellectual property rights are reserved. You may access this from Limitly for your own personal use subjected to restrictions set in these terms and conditions.

      ### 3. User Comments
      Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. Limitly does not filter, edit, publish or review Comments prior to their presence on the website.
    `
  },
  'cookies': {
    title: 'Cookie Policy',
    content: `
      This is the Cookie Policy for Limitly, accessible from limitly.com.

      ### What Are Cookies
      As is common practice with almost all professional websites this site uses cookies, which are tiny files that are downloaded to your computer, to improve your experience.

      ### How We Use Cookies
      We use cookies for a variety of reasons detailed below. Unfortunately in most cases there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.
    `
  }
};

const LegalPage = () => {
  const { pathname } = useLocation();
  const type = pathname.split('/').pop();
  const policy = POLICY_CONTENT[type] || POLICY_CONTENT['privacy'];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', color: '#1e293b' }}>
      
      {/* Mini Nav */}
      <nav style={{ padding: '1.5rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center' }}>
        <a href="/" style={{ fontWeight: 900, color: '#FACC15', textDecoration: 'none' }}>LIMITLY</a>
      </nav>

      <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '2rem', color: '#0f172a' }}>{policy.title}</h1>
        <div style={{ 
          background: '#fff', padding: '3rem', borderRadius: '24px', border: '1px solid #e2e8f0', 
          lineHeight: '1.8', whiteSpace: 'pre-line', fontSize: '1rem', color: '#334155' 
        }}>
          {policy.content}
        </div>

        <div style={{ marginTop: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
          Last updated: April 12, 2026
        </div>
      </div>
    </div>
  );
};

export default LegalPage;
