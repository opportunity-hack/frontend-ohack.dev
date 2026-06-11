import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  Preview as PreviewIcon,
  History as HistoryIcon,
  Email as EmailIcon,
  Share as ShareIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { useEnv } from '../../context/env.context';
import { SocialMediaManager } from '../../lib/social-media/SocialMediaManager';
import { SUPPORTED_PLATFORMS } from '../../lib/social-media/index';
import { useAuthInfo } from '@propelauth/react';
import BatchEmailDialog from './BatchEmailDialog';
import axios from 'axios';

const SocialMediaManagement = ({ onSnackbar }) => {
  const { accessToken, userClass } = useAuthInfo();
  const { apiServerUrl } = useEnv();
  const [manager, setManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [newsItems, setNewsItems] = useState([]);
  const [postingResults, setPostingResults] = useState([]);
  const [platformStatus, setPlatformStatus] = useState({});
  const [previewDialog, setPreviewDialog] = useState({ open: false, newsItem: null, platform: null });
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [postingHistory, setPostingHistory] = useState([]);
  const [adhocMessage, setAdhocMessage] = useState({
    text: '',
    channel: 'general',
    sending: false
  });

  // Email functionality state
  const [currentTab, setCurrentTab] = useState(0);
  const [slackUsers, setSlackUsers] = useState([]);
  const [loadingSlackUsers, setLoadingSlackUsers] = useState(true);
  const [batchEmailDialog, setBatchEmailDialog] = useState(false);
  const [emailResults, setEmailResults] = useState(null);

  // Additional recipients state
  const [additionalEmails, setAdditionalEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [csvFile, setCsvFile] = useState(null);
  const [processingEmails, setProcessingEmails] = useState(false);

  // Selection state
  const [selectedSlackUsers, setSelectedSlackUsers] = useState(new Set());
  const [slackSearchFilter, setSlackSearchFilter] = useState('');
  const [showSlackBrowser, setShowSlackBrowser] = useState(false);
  const [slackPasteInput, setSlackPasteInput] = useState('');
  const [slackPasteFeedback, setSlackPasteFeedback] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    dryRun: true,
    platforms: [SUPPORTED_PLATFORMS.THREADS],
    newsLimit: 5,
    autoRefresh: false,
    slackChannel: 'general'
  });

  // Fetch active Slack users for email functionality
  const fetchActiveSlackUsers = useCallback(async () => {
    if (!apiServerUrl || !accessToken) return;

    try {
      setLoadingSlackUsers(true);
      const org = userClass?.getOrgByName("Opportunity Hack Org");
      const orgId = org?.orgId;

      const response = await axios.get(
        `${apiServerUrl}/api/slack/admin/users/active?active_days=10000`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Org-Id": orgId,
          },
        }
      );

      if (response.data && response.data.users) {
        const activeUsers = response.data.users
          .filter(user => !user.deleted && !user.is_bot)
          .map(user => ({
            id: user.id,
            name: user.name,
            real_name: user.real_name,
            email: user.email,
            tz: user.tz,
            isSelected: false // Start with no one selected
          }));
        setSlackUsers(activeUsers);
        onSnackbar?.(`Loaded ${activeUsers.length} active Slack users`, 'success');
      } else {
        onSnackbar?.('Failed to fetch Slack users', 'error');
      }
    } catch (error) {
      console.error('Error fetching active Slack users:', error);
      onSnackbar?.('Failed to fetch active Slack users', 'error');
    } finally {
      setLoadingSlackUsers(false);
    }
  }, [apiServerUrl, accessToken, userClass]);

  // Fetch news from backend
  const fetchNews = useCallback(async (socialMediaManager) => {
    if (!socialMediaManager) return;
    
    try {
      setLoading(true);
      const news = await socialMediaManager.newsService.getNewsForSocialMedia({
        limit: settings.newsLimit
      });
      setNewsItems(news);
      onSnackbar?.(`Fetched ${news.length} news items`, 'success');
    } catch (error) {
      console.error('Error fetching news:', error);
      onSnackbar?.('Failed to fetch news', 'error');
    } finally {
      setLoading(false);
    }
  }, [settings.newsLimit]); // Remove onSnackbar dependency

  // Initialize social media manager
  useEffect(() => {
    const initializeManager = async () => {
      try {
        // Only initialize on client side to avoid SSR issues
        if (typeof window === 'undefined' || !apiServerUrl || !accessToken) return;
        
        const org = userClass?.getOrgByName("Opportunity Hack Org");
        const orgId = org?.orgId;
        
        const userCredentials = {
          accessToken,
          orgId
        };
        
        const socialMediaManager = SocialMediaManager.createFromEnvironment(process.env, apiServerUrl, userCredentials);
        setManager(socialMediaManager);
        
        // Validate platform credentials
        const validation = await socialMediaManager.validateAllCredentials();
        setPlatformStatus(validation);
        
        // Get posting history
        const history = socialMediaManager.getPostingHistory(10);
        setPostingHistory(history);
        
      } catch (error) {
        console.error('Error initializing social media manager:', error);
        onSnackbar?.('Failed to initialize social media manager', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeManager();
  }, [apiServerUrl, accessToken, userClass]); // Add accessToken and userClass dependencies

  // Separate useEffect for fetching news when manager is ready
  useEffect(() => {
    if (manager) {
      fetchNews(manager);
    }
  }, [manager]); // Only depend on manager, not fetchNews

  // Fetch Slack users when component mounts
  useEffect(() => {
    fetchActiveSlackUsers();
  }, [fetchActiveSlackUsers]);

  // Post news to social media
  const handlePostNews = async () => {
    if (!manager || newsItems.length === 0) return;
    
    try {
      setPosting(true);
      const results = await manager.postLatestNews({
        platforms: settings.platforms,
        limit: settings.newsLimit,
        dryRun: settings.dryRun,
        slackChannel: settings.slackChannel
      });
      
      setPostingResults(results.results || []);
      
      if (results.success) {
        onSnackbar?.(results.message, 'success');
        
        // Update posting history if not dry run
        if (!settings.dryRun) {
          const history = manager.getPostingHistory(10);
          setPostingHistory(history);
        }
      } else {
        onSnackbar?.(results.message, 'error');
      }
    } catch (error) {
      console.error('Error posting news:', error);
      onSnackbar?.('Failed to post news', 'error');
    } finally {
      setPosting(false);
    }
  };

  // Preview formatted content
  const handlePreview = (newsItem, platform) => {
    if (!manager) return;
    
    const service = manager.getService(platform);
    if (service) {
      setPreviewDialog({
        open: true,
        newsItem,
        platform,
        formattedContent: service.formatContent(newsItem),
        service
      });
    }
  };

  // Refresh platform status
  const handleRefreshStatus = async () => {
    if (!manager) return;
    
    try {
      const validation = await manager.validateAllCredentials();
      setPlatformStatus(validation);
      onSnackbar?.('Platform status refreshed', 'success');
    } catch (error) {
      console.error('Error refreshing status:', error);
      onSnackbar?.('Failed to refresh platform status', 'error');
    }
  };

  // Send adhoc message to Slack
  const handleSendAdhocMessage = async () => {
    if (!manager || !adhocMessage.text.trim()) return;

    try {
      setAdhocMessage({ ...adhocMessage, sending: true });

      const slackService = manager.getService('slack');
      if (!slackService) {
        onSnackbar?.('Slack service not available', 'error');
        return;
      }

      const result = await slackService.post(adhocMessage.text, adhocMessage.channel);

      if (result.success) {
        onSnackbar?.(`Message sent to #${adhocMessage.channel}`, 'success');
        setAdhocMessage({ text: '', channel: adhocMessage.channel, sending: false });
      } else {
        onSnackbar?.(result.message || 'Failed to send message', 'error');
      }
    } catch (error) {
      console.error('Error sending adhoc message:', error);
      onSnackbar?.('Failed to send message', 'error');
    } finally {
      setAdhocMessage({ ...adhocMessage, sending: false });
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Handle batch email completion
  const handleEmailComplete = (summary) => {
    setEmailResults(summary);
    onSnackbar?.(`Email batch complete: ${summary.successful}/${summary.total} successful`, summary.successful === summary.total ? 'success' : 'warning');
  };

  // Get orgId for email functionality
  const getOrgId = () => {
    const org = userClass?.getOrgByName("Opportunity Hack Org");
    return org?.orgId;
  };

  // Email parsing and validation utilities
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const parseEmailsFromText = (text) => {
    if (!text) return [];

    // Split by common delimiters: comma, semicolon, space, newline
    const emails = text
      .split(/[,;\s\n]+/)
      .map(email => email.trim())
      .filter(email => email.length > 0)
      .filter(validateEmail);

    return [...new Set(emails)]; // Remove duplicates
  };

  const normalizeSlackLookupToken = (value) => {
    if (!value) return '';

    let normalized = value.trim().replace(/^['"]+|['"]+$/g, '');
    if (!normalized) return '';

    const slackMentionMatch = normalized.match(/^<@([A-Z0-9]+)>$/i);
    if (slackMentionMatch) {
      return slackMentionMatch[1].toLowerCase();
    }

    const embeddedEmailMatch = normalized.match(/<?([^\s<>]+@[^\s<>]+)>?/);
    if (embeddedEmailMatch) {
      return embeddedEmailMatch[1].toLowerCase();
    }

    normalized = normalized.replace(/^@/, '');
    return normalized.toLowerCase();
  };

  const parseSlackLookupInput = (text) => {
    if (!text) return [];

    return [...new Set(
      text
        .split(/[\n,;]+/)
        .map(token => token.trim())
        .filter(Boolean)
    )];
  };

  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n');
          const emails = [];

          lines.forEach(line => {
            // Split by comma and extract potential emails
            const fields = line.split(',').map(field => field.trim().replace(/[\"']/g, ''));
            fields.forEach(field => {
              if (validateEmail(field)) {
                emails.push(field);
              }
            });
          });

          resolve([...new Set(emails)]); // Remove duplicates
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Handle email input processing
  const handleAddEmails = async () => {
    if (!emailInput.trim() && !csvFile) return;

    setProcessingEmails(true);

    try {
      let newEmails = [];

      if (emailInput.trim()) {
        newEmails = parseEmailsFromText(emailInput);
      }

      if (csvFile) {
        const csvEmails = await parseCsvFile(csvFile);
        newEmails = [...new Set([...newEmails, ...csvEmails])];
      }

      if (newEmails.length === 0) {
        onSnackbar?.('No valid emails found', 'warning');
        return;
      }

      // Convert to user objects
      const emailUsers = newEmails.map((email, index) => ({
        id: `custom_${Date.now()}_${index}`,
        name: email.split('@')[0], // Use email prefix as name
        real_name: email.split('@')[0],
        email: email,
        isSelected: true,
        source: 'custom'
      }));

      const existingEmails = new Set([...slackUsers.map(u => u.email), ...additionalEmails.map(u => u.email)]);
      const uniqueNewEmails = emailUsers.filter(user => !existingEmails.has(user.email));

      setAdditionalEmails(prev => [...prev, ...uniqueNewEmails]);
      setEmailInput('');
      setCsvFile(null);

      onSnackbar?.(`Added ${uniqueNewEmails.length} new emails (${newEmails.length - uniqueNewEmails.length} duplicates skipped)`, 'success');
    } catch (error) {
      console.error('Error processing emails:', error);
      onSnackbar?.('Error processing emails: ' + error.message, 'error');
    } finally {
      setProcessingEmails(false);
    }
  };

  // Remove custom email
  const handleRemoveCustomEmail = (emailToRemove) => {
    setAdditionalEmails(prev => prev.filter(user => user.email !== emailToRemove));
  };

  // Clear all custom emails
  const handleClearCustomEmails = () => {
    setAdditionalEmails([]);
    setEmailInput('');
    setCsvFile(null);
  };

  // Selection management functions
  const toggleSlackUserSelection = (userId) => {
    setSelectedSlackUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const selectAllSlackUsers = () => {
    const filteredUsers = getFilteredSlackUsers();
    setSelectedSlackUsers(new Set(filteredUsers.map(u => u.id)));
  };

  const deselectAllSlackUsers = () => {
    setSelectedSlackUsers(new Set());
  };

  const getFilteredSlackUsers = () => {
    if (!slackSearchFilter.trim()) return slackUsers.filter(u => u.email);

    const searchTerm = slackSearchFilter.toLowerCase();
    return slackUsers.filter(user =>
      user.email &&
      (
        user.name?.toLowerCase().includes(searchTerm) ||
        user.real_name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm)
      )
    );
  };

  const handlePasteSelectSlackUsers = () => {
    const rawTokens = parseSlackLookupInput(slackPasteInput);

    if (rawTokens.length === 0) {
      onSnackbar?.('Paste at least one Slack email, @handle, real name, or Slack ID', 'warning');
      return;
    }

    const lookup = new Map();

    slackUsers
      .filter(user => user.email)
      .forEach((user) => {
        const keys = [user.id, user.name, user.real_name, user.email]
          .map(normalizeSlackLookupToken)
          .filter(Boolean);

        [...new Set(keys)].forEach((key) => {
          if (!lookup.has(key)) {
            lookup.set(key, []);
          }

          const matches = lookup.get(key);
          if (!matches.find(match => match.id === user.id)) {
            matches.push(user);
          }
        });
      });

    const matchedIds = new Set();
    const unmatchedTokens = [];
    const ambiguousTokens = [];
    let alreadySelectedCount = 0;

    rawTokens.forEach((token) => {
      const normalizedToken = normalizeSlackLookupToken(token);
      if (!normalizedToken) {
        return;
      }

      const matches = lookup.get(normalizedToken) || [];

      if (matches.length === 0) {
        unmatchedTokens.push(token);
        return;
      }

      if (matches.length > 1) {
        ambiguousTokens.push(token);
        return;
      }

      const matchedUser = matches[0];
      if (selectedSlackUsers.has(matchedUser.id) || matchedIds.has(matchedUser.id)) {
        alreadySelectedCount += 1;
      }

      matchedIds.add(matchedUser.id);
    });

    if (matchedIds.size > 0) {
      setSelectedSlackUsers((prev) => new Set([...prev, ...matchedIds]));
    }

    const remainingTokens = [...ambiguousTokens, ...unmatchedTokens];
    setSlackPasteInput(remainingTokens.join('\n'));
    setSlackPasteFeedback({
      requestedCount: rawTokens.length,
      matchedCount: matchedIds.size,
      alreadySelectedCount,
      unmatchedTokens,
      ambiguousTokens,
    });

    if (matchedIds.size === 0) {
      onSnackbar?.('No Slack users matched the pasted list', 'warning');
      return;
    }

    const messageParts = [`Matched ${matchedIds.size} Slack user${matchedIds.size === 1 ? '' : 's'}`];

    if (alreadySelectedCount > 0) {
      messageParts.push(`${alreadySelectedCount} already selected`);
    }
    if (ambiguousTokens.length > 0) {
      messageParts.push(`${ambiguousTokens.length} ambiguous`);
    }
    if (unmatchedTokens.length > 0) {
      messageParts.push(`${unmatchedTokens.length} not found`);
    }

    onSnackbar?.(messageParts.join(' · '), unmatchedTokens.length > 0 || ambiguousTokens.length > 0 ? 'warning' : 'success');
  };

  const getSelectedUsers = () => {
    const selectedSlack = slackUsers
      .filter(user => selectedSlackUsers.has(user.id) && user.email)
      .map(user => ({
        ...user,
        isSelected: true // Mark as selected for BatchEmailDialog
      }));
    return [...selectedSlack, ...additionalEmails];
  };

  const getSelectedUsersCount = () => {
    return selectedSlackUsers.size + additionalEmails.length;
  };

  const getPlatformStatusColor = (status) => {
    if (!status) return 'default';
    return status.valid ? 'success' : 'error';
  };

  const getPlatformStatusIcon = (status) => {
    if (!status) return <InfoIcon />;
    return status.valid ? <CheckCircleIcon /> : <ErrorIcon />;
  };

  if (loading && !manager) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Tab Navigation */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange} aria-label="social media tabs">
          <Tab
            icon={<ShareIcon />}
            label="Social Media"
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab
            icon={<EmailIcon />}
            label="Email Communication"
            id="tab-1"
            aria-controls="tabpanel-1"
          />
        </Tabs>
      </Paper>

      {/* Tab Panel 0: Social Media */}
      <Box hidden={currentTab !== 0}>
      {/* Platform Status Cards */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Platform Status</Typography>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefreshStatus}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          {Object.entries(platformStatus).map(([platform, status]) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={platform}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getPlatformStatusIcon(status)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {status.platform}
                    </Typography>
                  </Box>
                  <Chip
                    label={status.valid ? 'Connected' : 'Not Connected'}
                    color={getPlatformStatusColor(status)}
                    size="small"
                  />
                  {status.error && (
                    <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                      {status.error}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Adhoc Slack Message */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Send Message to Slack
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel size="small">Channel</InputLabel>
            <Select
              size="small"
              value={adhocMessage.channel}
              label="Channel"
              onChange={(e) => setAdhocMessage({ ...adhocMessage, channel: e.target.value })}
            >
              <MenuItem value="general">general</MenuItem>
              <MenuItem value="ask-a-mentor">ask-a-mentor</MenuItem>
            </Select>
          </FormControl>
          <TextField
            multiline
            rows={3}
            placeholder="Type your message here..."
            value={adhocMessage.text}
            onChange={(e) => setAdhocMessage({ ...adhocMessage, text: e.target.value })}
            sx={{ flexGrow: 1 }}
            disabled={adhocMessage.sending}
          />
          <Button
            variant="contained"
            startIcon={adhocMessage.sending ? <CircularProgress size={16} /> : <SendIcon />}
            onClick={handleSendAdhocMessage}
            disabled={adhocMessage.sending || !adhocMessage.text.trim()}
            sx={{ height: 'fit-content', mt: 1 }}
          >
            Send
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          This will send a direct message to the selected Slack channel
        </Typography>
      </Paper>

      {/* Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Social Media Posting</Typography>
          <Box>
            <Button
              startIcon={<SettingsIcon />}
              onClick={() => setSettingsDialog(true)}
              sx={{ mr: 2 }}
            >
              Settings
            </Button>
            <Button
              startIcon={<RefreshIcon />}
              onClick={() => fetchNews(manager)}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              Refresh News
            </Button>
            <Button
              variant="contained"
              startIcon={posting ? <CircularProgress size={16} /> : <SendIcon />}
              onClick={handlePostNews}
              disabled={posting || newsItems.length === 0}
            >
              {settings.dryRun ? 'Preview Posts' : 'Post to Social Media'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Chip
            label={`${newsItems.length} news items`}
            color={newsItems.length > 0 ? 'primary' : 'default'}
          />
          <Chip
            label={`${settings.platforms.length} platforms`}
            color="secondary"
          />
          <Chip
            label={settings.dryRun ? 'Preview Mode' : 'Live Mode'}
            color={settings.dryRun ? 'warning' : 'success'}
          />
          {settings.platforms.includes(SUPPORTED_PLATFORMS.SLACK) && (
            <Chip
              label={`Slack: #${settings.slackChannel}`}
              color="info"
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* News Items */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Latest News ({newsItems.length} items)
        </Typography>
        
        {newsItems.length === 0 ? (
          <Alert severity="info">
            No news items available for posting. Try refreshing or check your news API.
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {newsItems.map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {item.content.substring(0, 150)}...
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {new Date(item.publishedAt).toLocaleDateString()}
                    </Typography>
                    {item.slackPermalink && (
                      <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                        📢 From Slack
                      </Typography>
                    )}
                    {item.imageUrl && (
                      <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                        🖼️ Has Image
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    {settings.platforms.map((platform) => (
                      <Button
                        key={platform}
                        startIcon={<PreviewIcon />}
                        size="small"
                        onClick={() => handlePreview(item, platform)}
                      >
                        Preview {platform}
                      </Button>
                    ))}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Posting Results */}
      {postingResults.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {settings.dryRun ? 'Preview Results' : 'Posting Results'}
          </Typography>
          
          {postingResults.map((result, index) => (
            <Accordion key={index}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{result.newsItem.title}</Typography>
                <Box sx={{ ml: 'auto', mr: 2 }}>
                  {result.dryRun ? (
                    <Chip label="Preview" color="info" size="small" />
                  ) : (
                    <Chip
                      label={`${result.summary?.successful || 0}/${result.summary?.total || 0} successful`}
                      color={result.summary?.successful === result.summary?.total ? 'success' : 'warning'}
                      size="small"
                    />
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {Object.entries(result.platforms).map(([platform, platformResult]) => (
                  <Box key={platform} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {platform.toUpperCase()}
                    </Typography>
                    {result.dryRun ? (
                      <Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                          {platformResult.formattedContent}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {platformResult.characterCount} characters
                          {platformResult.withinLimit ? ' ✓' : ' ⚠️ Exceeds limit'}
                          {platformResult.channel && ` | Channel: #${platformResult.channel}`}
                        </Typography>
                      </Box>
                    ) : (
                      <Alert severity={platformResult.success ? 'success' : 'error'}>
                        {platformResult.message}
                        {platformResult.channel && (
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            Posted to #{platformResult.channel}
                          </Typography>
                        )}
                        {platformResult.url && (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              href={platformResult.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              size="small"
                            >
                              View Post
                            </Button>
                          </Box>
                        )}
                      </Alert>
                    )}
                  </Box>
                ))}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Posting History */}
      {postingHistory.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Posting History
          </Typography>
          
          <List>
            {postingHistory.slice(0, 5).map((entry, index) => (
              <ListItem key={index} divider>
                <ListItemIcon>
                  {entry.results.summary?.successful === entry.results.summary?.total ? 
                    <CheckCircleIcon color="success" /> : 
                    <ErrorIcon color="error" />
                  }
                </ListItemIcon>
                <ListItemText
                  primary={entry.newsItem.title}
                  secondary={`${new Date(entry.timestamp).toLocaleString()} - ${entry.results.summary?.successful}/${entry.results.summary?.total} platforms`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Social Media Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.dryRun}
                  onChange={(e) => setSettings({ ...settings, dryRun: e.target.checked })}
                />
              }
              label="Dry Run Mode (Preview Only)"
            />
            
            <Box sx={{ mt: 3 }}>
              <TextField
                label="News Items Limit"
                type="number"
                value={settings.newsLimit}
                onChange={(e) => setSettings({ ...settings, newsLimit: parseInt(e.target.value) || 5 })}
                inputProps={{ min: 1, max: 20 }}
                fullWidth
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Platforms to Post To:
              </Typography>
              {Object.values(SUPPORTED_PLATFORMS).map((platform) => (
                <FormControlLabel
                  key={platform}
                  control={
                    <Switch
                      checked={settings.platforms.includes(platform)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings({ ...settings, platforms: [...settings.platforms, platform] });
                        } else {
                          setSettings({ ...settings, platforms: settings.platforms.filter(p => p !== platform) });
                        }
                      }}
                    />
                  }
                  label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                />
              ))}
            </Box>

            {settings.platforms.includes(SUPPORTED_PLATFORMS.SLACK) && (
              <Box sx={{ mt: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Slack Channel</InputLabel>
                  <Select
                    value={settings.slackChannel}
                    label="Slack Channel"
                    onChange={(e) => setSettings({ ...settings, slackChannel: e.target.value })}
                  >
                    <MenuItem value="general">general</MenuItem>
                    <MenuItem value="ask-a-mentor">ask-a-mentor</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>Cancel</Button>
          <Button onClick={() => setSettingsDialog(false)} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialog.open} onClose={() => setPreviewDialog({ open: false, newsItem: null, platform: null })} maxWidth="md" fullWidth>
        <DialogTitle>
          Preview for {previewDialog.platform?.charAt(0).toUpperCase() + previewDialog.platform?.slice(1)}
        </DialogTitle>
        <DialogContent>
          {previewDialog.formattedContent && (
            <Box sx={{ py: 2 }}>
              <Typography variant="h6" gutterBottom>
                {previewDialog.newsItem?.title}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                {previewDialog.formattedContent}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" color="text.secondary">
                  {previewDialog.formattedContent.length} / {previewDialog.service?.characterLimit} characters
                </Typography>
                <Chip
                  label={previewDialog.formattedContent.length <= previewDialog.service?.characterLimit ? 'Within Limit' : 'Exceeds Limit'}
                  color={previewDialog.formattedContent.length <= previewDialog.service?.characterLimit ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog({ open: false, newsItem: null, platform: null })}>Close</Button>
        </DialogActions>
      </Dialog>
      </Box>

      {/* Tab Panel 1: Email Communication */}
      <Box hidden={currentTab !== 1}>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Email Communication to Slack Community
            </Typography>
            <Box>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchActiveSlackUsers}
                disabled={loadingSlackUsers}
                sx={{ mr: 2 }}
              >
                Refresh Users
              </Button>
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                onClick={() => setBatchEmailDialog(true)}
                disabled={loadingSlackUsers || slackUsers.length === 0}
              >
                Send Batch Email
              </Button>
            </Box>
          </Box>

          {loadingSlackUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Selection Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📧 Selected Recipients ({getSelectedUsersCount()})
                </Typography>

                {getSelectedUsersCount() === 0 ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>No recipients selected.</strong> Choose from Slack community members or add custom email addresses to get started.
                    </Typography>
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    {selectedSlackUsers.size > 0 && (
                      <Chip
                        label={`${selectedSlackUsers.size} from Slack`}
                        color="primary"
                        icon={<GroupIcon />}
                      />
                    )}
                    {additionalEmails.length > 0 && (
                      <Chip
                        label={`${additionalEmails.length} custom emails`}
                        color="success"
                        icon={<EmailIcon />}
                      />
                    )}
                    <Chip
                      label={`${getSelectedUsersCount()} total recipients`}
                      color="info"
                      variant="outlined"
                      icon={<EmailIcon />}
                    />
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<GroupIcon />}
                  onClick={() => setShowSlackBrowser(true)}
                  disabled={loadingSlackUsers || slackUsers.length === 0}
                >
                  Browse Slack Users ({slackUsers.filter(u => u.email).length} available)
                </Button>

                {getSelectedUsersCount() > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<EmailIcon />}
                    onClick={() => setBatchEmailDialog(true)}
                    color="primary"
                  >
                    Send Email to {getSelectedUsersCount()} Recipients
                  </Button>
                )}

                {(selectedSlackUsers.size > 0 || additionalEmails.length > 0) && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setSelectedSlackUsers(new Set());
                      setAdditionalEmails([]);
                    }}
                  >
                    Clear All Selections
                  </Button>
                )}
              </Box>

              {slackUsers.length === 0 && (
                <Alert severity="warning">
                  No active Slack users found. Try refreshing or check your Slack integration.
                </Alert>
              )}

              {emailResults && (
                <Alert severity={emailResults.successful === emailResults.total ? 'success' : 'warning'} sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Last email batch: {emailResults.successful}/{emailResults.total} successful
                    {emailResults.failed > 0 && ` (${emailResults.failed} failed)`}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </Paper>

        {/* Additional Recipients Section */}
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            <EmailIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Additional Recipients
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Add custom email addresses beyond the Slack community. You can copy/paste emails or upload a CSV file.
          </Typography>

          <Grid container spacing={2}>
            {/* Email Input Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Copy/Paste Emails
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Paste emails here... (comma, semicolon, space, or newline separated)
Example:
john@example.com, jane@test.com
user@domain.org; admin@site.net"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                variant="outlined"
                disabled={processingEmails}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* CSV Upload Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="subtitle2" gutterBottom>
                Upload CSV File
              </Typography>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: csvFile ? 'success.main' : 'grey.300',
                  borderRadius: 1,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: csvFile ? 'success.50' : 'grey.50',
                  mb: 2,
                  height: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}
              >
                <input
                  accept=".csv,.txt"
                  style={{ display: 'none' }}
                  id="csv-upload"
                  type="file"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  disabled={processingEmails}
                />
                <label htmlFor="csv-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    disabled={processingEmails}
                    sx={{ mb: 1 }}
                  >
                    Choose CSV File
                  </Button>
                </label>
                {csvFile ? (
                  <Typography variant="body2" color="success.main">
                    ✓ {csvFile.name} ({(csvFile.size / 1024).toFixed(1)} KB)
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    CSV with emails in any column
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddEmails}
              disabled={processingEmails || (!emailInput.trim() && !csvFile)}
              startIcon={processingEmails ? <CircularProgress size={16} /> : <EmailIcon />}
            >
              {processingEmails ? 'Processing...' : 'Add Emails'}
            </Button>
            {additionalEmails.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearCustomEmails}
                disabled={processingEmails}
              >
                Clear All ({additionalEmails.length})
              </Button>
            )}
          </Box>

          {/* Custom Emails Display */}
          {additionalEmails.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Custom Recipients ({additionalEmails.length}):
              </Typography>
              <Box sx={{ maxHeight: '200px', overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {additionalEmails.map((user, index) => (
                    <Grid key={user.id}>
                      <Chip
                        label={user.email}
                        size="small"
                        onDelete={() => handleRemoveCustomEmail(user.email)}
                        color="secondary"
                        variant="outlined"
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </Paper>
      </Box>

      {/* Slack User Browser Dialog */}
      <Dialog
        open={showSlackBrowser}
        onClose={() => setShowSlackBrowser(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              <GroupIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Browse Slack Users
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              {selectedSlackUsers.size} of {getFilteredSlackUsers().length} selected
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Search and Bulk Actions */}
          <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search by name or email..."
              value={slackSearchFilter}
              onChange={(e) => setSlackSearchFilter(e.target.value)}
              size="small"
              sx={{ flexGrow: 1, minWidth: 250 }}
              InputProps={{
                startAdornment: <Box sx={{ mr: 1 }}>🔍</Box>
              }}
            />
            <Button
              size="small"
              onClick={selectAllSlackUsers}
              disabled={getFilteredSlackUsers().length === 0}
            >
              Select All ({getFilteredSlackUsers().length})
            </Button>
            <Button
              size="small"
              onClick={deselectAllSlackUsers}
              disabled={selectedSlackUsers.size === 0}
              color="error"
            >
              Clear All
            </Button>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Paste Slack users
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Paste one item per line or comma-separated. Match by email, Slack @handle,
              real name, or Slack user ID.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                multiline
                minRows={3}
                maxRows={6}
                placeholder={'jane@example.com\n@johnsmith\nU123ABC45\nJane Doe'}
                value={slackPasteInput}
                onChange={(e) => setSlackPasteInput(e.target.value)}
                sx={{ flexGrow: 1, minWidth: 280 }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'row', sm: 'column' } }}>
                <Button
                  variant="contained"
                  onClick={handlePasteSelectSlackUsers}
                  disabled={!slackPasteInput.trim()}
                >
                  Select Matches
                </Button>
                <Button
                  variant="text"
                  color="inherit"
                  onClick={() => {
                    setSlackPasteInput('');
                    setSlackPasteFeedback(null);
                  }}
                  disabled={!slackPasteInput && !slackPasteFeedback}
                >
                  Clear Paste
                </Button>
              </Box>
            </Box>

            {slackPasteFeedback && (
              <Alert
                severity={
                  slackPasteFeedback.unmatchedTokens.length > 0 || slackPasteFeedback.ambiguousTokens.length > 0
                    ? 'warning'
                    : 'success'
                }
                sx={{ mt: 1.5 }}
              >
                <Typography variant="body2">
                  Matched <strong>{slackPasteFeedback.matchedCount}</strong> of{' '}
                  <strong>{slackPasteFeedback.requestedCount}</strong> pasted entries.
                  {slackPasteFeedback.alreadySelectedCount > 0 && (
                    <> {slackPasteFeedback.alreadySelectedCount} were already selected.</>
                  )}
                </Typography>
                {slackPasteFeedback.ambiguousTokens.length > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Ambiguous: {slackPasteFeedback.ambiguousTokens.slice(0, 5).join(', ')}
                    {slackPasteFeedback.ambiguousTokens.length > 5 ? '…' : ''}
                  </Typography>
                )}
                {slackPasteFeedback.unmatchedTokens.length > 0 && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                    Not found: {slackPasteFeedback.unmatchedTokens.slice(0, 5).join(', ')}
                    {slackPasteFeedback.unmatchedTokens.length > 5 ? '…' : ''}
                  </Typography>
                )}
              </Alert>
            )}
          </Box>

          {/* Users List */}
          <Box sx={{ maxHeight: '400px', overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            {getFilteredSlackUsers().length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {slackSearchFilter.trim() ? 'No users match your search.' : 'No users with email addresses found.'}
                </Typography>
              </Box>
            ) : (
              <List dense>
                {getFilteredSlackUsers().map((user) => (
                  <ListItem key={user.id} divider>
                    <ListItemIcon>
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={selectedSlackUsers.has(user.id)}
                            onChange={() => toggleSlackUserSelection(user.id)}
                          />
                        }
                        label=""
                        sx={{ m: 0 }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={user.real_name || user.name}
                      secondary={user.email}
                      primaryTypographyProps={{ fontWeight: selectedSlackUsers.has(user.id) ? 'bold' : 'normal' }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Selection Summary */}
          {selectedSlackUsers.size > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                ✓ <strong>{selectedSlackUsers.size}</strong> Slack users selected for email delivery
              </Typography>
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowSlackBrowser(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => setShowSlackBrowser(false)}
            variant="contained"
            disabled={selectedSlackUsers.size === 0}
          >
            Apply Selection ({selectedSlackUsers.size} users)
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Email Dialog */}
      <BatchEmailDialog
        open={batchEmailDialog}
        onClose={() => setBatchEmailDialog(false)}
        volunteers={getSelectedUsers()}
        volunteerType="community members"
        accessToken={accessToken}
        orgId={getOrgId()}
        eventId={null}
        onComplete={handleEmailComplete}
        isSelectedUsers={true}
      />
    </Box>
  );
};

export default SocialMediaManagement;