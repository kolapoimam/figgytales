const Results: React.FC = () => {
  const { stories, clearFiles, createShareLink, user, setStories } = useFiles(); // Added setStories
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  // Load stories from localStorage if context is empty
  useEffect(() => {
    if (stories.length === 0) {
      const savedStories = localStorage.getItem('figgytales_stories');
      if (savedStories) {
        try {
          const parsedStories = JSON.parse(savedStories);
          if (Array.isArray(parsedStories) && parsedStories.length > 0) {
            setStories(parsedStories); // Actually set the stories in context
          }
        } catch (e) {
          console.error("Error parsing saved stories:", e);
        }
      }
    }
  }, [stories.length, setStories]); // Added setStories to dependencies

  const startOver = () => {
    // Clear both files and stories completely
    clearFiles();
    setStories([]); // Clear stories in context
    localStorage.removeItem('figgytales_stories'); // Remove from localStorage
    localStorage.removeItem('figgytales_files'); // Clear any stored files
    navigate('/', { replace: true }); // Navigate to home without keeping in history
  };

  // ... rest of your component remains the same ...
};
