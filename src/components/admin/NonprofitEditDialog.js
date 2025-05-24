import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  Autocomplete,
  InputAdornment,
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import ImageUpload from './ImageUpload';

const NonprofitEditDialog = ({
  open,
  onClose,
  nonprofit,
  onSave,
  problemStatements,
  accessToken,
  orgId,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    slack_channel: "",
    contact_people: [],
    contact_email: [],
    problem_statements: [],
    image: "",
    rank: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (nonprofit) {
      setFormData({
        ...nonprofit,
        contact_people: nonprofit.contact_people?.join(", ") || "",
        contact_email: nonprofit.contact_email?.join(", ") || "",
        problem_statements: nonprofit.problem_statements || [],
      });
      setErrors({});
    } else {
      setFormData({
        name: "",
        description: "",
        website: "",
        slack_channel: "",
        contact_people: "",
        contact_email: "",
        problem_statements: [],
        image: "",
        rank: 0,
      });
      setErrors({});
    }
  }, [nonprofit, open]);

  const transformPhotoUrl = (url) => {
    if (!url) return url;
    return url.replace(
      "https://storage.googleapis.com/ohack-dev_cdn",
      "https://cdn.ohack.dev"
    );
  };

  const formatSlackChannel = (name) => {
    if (!name) return "";
    // Convert to lowercase, replace spaces with dashes, and remove special characters
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '');
  };

  const validateUrl = (url) => {
    if (!url) return true; // Not required, but if provided must be valid
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const validateEmail = (email) => {
    if (!email) return true; // Not required, but if provided must be valid
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.website.trim()) newErrors.website = "Website is required";
    if (!formData.slack_channel.trim()) newErrors.slack_channel = "Slack channel is required";
    
    // URL validation
    if (formData.website.trim() && !validateUrl(formData.website.trim())) {
      newErrors.website = "Invalid website URL";
    }
    
    // Email validation
    if (formData.contact_email) {
      const emails = formData.contact_email.split(',');
      const invalidEmails = emails.filter(email => email.trim() && !validateEmail(email.trim()));
      if (invalidEmails.length > 0) {
        newErrors.contact_email = `Invalid email(s): ${invalidEmails.join(', ')}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Apply special transformations based on field name
    if (name === "image") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: transformPhotoUrl(value),
      }));
    } else if (name === "slack_channel") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: formatSlackChannel(value),
      }));
    } else if (name === "name") {
      // Update name normally
      setFormData((prevData) => {
        const updatedData = {
          ...prevData,
          [name]: value,
        };
        
        // Only auto-generate slack channel if it's empty or hasn't been manually edited
        if (!prevData.slack_channel || prevData.slack_channel === formatSlackChannel(prevData.name)) {
          updatedData.slack_channel = formatSlackChannel(value);
        }
        
        return updatedData;
      });
    } else if (name === "rank") {
      // Ensure rank is a number
      const numValue = value === "" ? "" : parseInt(value, 10) || 0;
      setFormData((prevData) => ({
        ...prevData,
        [name]: numValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleProblemStatementChange = (event, newValues) => {
    setFormData((prevData) => ({
      ...prevData,
      problem_statements: newValues,
    }));
  };

  const handleSave = () => {
    setIsSubmitting(true);
    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    const savedData = {
      ...formData,
      // Trim all string values
      name: formData.name.trim(),
      description: formData.description.trim(),
      website: formData.website.trim(),
      slack_channel: formData.slack_channel.trim(),
      image: formData.image?.trim() || "",
      // Parse arrays from comma-separated strings
      contact_people: formData.contact_people
        ? formData.contact_people
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
      contact_email: formData.contact_email
        ? formData.contact_email
            .split(",")
            .map((item) => item.trim())
            .filter(item => item && validateEmail(item))
        : [],
      // Ensure rank is a number
      rank: parseInt(formData.rank || 0, 10),
    };
    onSave(savedData);
    setIsSubmitting(false);
  };

  // State for problem statement search
  const [problemStatementSearch, setProblemStatementSearch] = useState("");
  
  // Filter problem statements based on search
  const filteredProblemStatements = problemStatements.filter(ps => 
    ps.title.toLowerCase().includes(problemStatementSearch.toLowerCase()) ||
    (ps.description && ps.description.toLowerCase().includes(problemStatementSearch.toLowerCase()))
  );
  
  // Helper function to get problem statement title by id
  const getProblemStatementTitle = (id) => {
    const statement = problemStatements.find(ps => ps.id === id);
    return statement ? statement.title : id;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {nonprofit ? "Edit Nonprofit" : "Add New Nonprofit"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            error={!!errors.name}
            helperText={errors.name || "Required field"}
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            error={!!errors.description}
            helperText={errors.description || "Required field"}
          />
          <TextField
            fullWidth
            label="Website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            required
            error={!!errors.website}
            helperText={errors.website || "Required valid URL (e.g., https://example.org)"}
          />
          <TextField
            fullWidth
            label="Slack Channel"
            name="slack_channel"
            value={formData.slack_channel}
            onChange={handleChange}
            required
            error={!!errors.slack_channel}
            helperText={errors.slack_channel || "Automatically formatted for Slack (lowercase, dashes instead of spaces)"}
          />
          <TextField
            fullWidth
            label="Contact People (comma-separated)"
            name="contact_people"
            value={formData.contact_people}
            onChange={handleChange}
          />
          <TextField
            fullWidth
            label="Contact Emails (comma-separated)"
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
            error={!!errors.contact_email}
            helperText={errors.contact_email || "Valid email addresses only"}
          />
          <ImageUpload
            label="Nonprofit Image"
            value={formData.image}
            onChange={(url) => handleChange({ target: { name: 'image', value: url } })}
            helperText="Upload an image file or enter a URL. Google Storage URLs will be automatically converted to CDN format"
            directory="nonprofits"
            accessToken={accessToken}
            orgId={orgId}
          />
          <TextField
            fullWidth
            label="Rank"
            name="rank"
            type="number"
            value={formData.rank}
            onChange={handleChange}
            InputProps={{ inputProps: { min: 0 } }}
          />
          <FormControl fullWidth>
            <Typography variant="subtitle1" gutterBottom>
              Problem Statements
            </Typography>
            <TextField
              fullWidth
              placeholder="Search problem statements..."
              value={problemStatementSearch}
              onChange={(e) => setProblemStatementSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            
            <Autocomplete
              multiple
              id="problem-statements-autocomplete"
              options={filteredProblemStatements.map(ps => ps.id)}
              value={formData.problem_statements || []}
              onChange={handleProblemStatementChange}
              getOptionLabel={(option) => getProblemStatementTitle(option)}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  variant="outlined" 
                  placeholder={formData.problem_statements?.length > 0 ? "" : "Select problem statements..."}
                />
              )}
              renderOption={(props, option) => {
                const statement = problemStatements.find(ps => ps.id === option);
                return (
                  <MenuItem {...props} key={option}>
                    <Box>
                      <Typography variant="body1">{statement?.title || option}</Typography>
                      {statement?.description && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {statement.description.substring(0, 100)}
                          {statement.description.length > 100 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                );
              }}
              renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                  <Chip
                    label={getProblemStatementTitle(option)}
                    {...getTagProps({ index })}
                    key={option}
                  />
                ))
              }
              filterSelectedOptions
              isOptionEqualToValue={(option, value) => option === value}
              limitTags={3}
            />
            <FormHelperText>
              Search and select problem statements. You can select multiple statements.
            </FormHelperText>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          color="primary"
          disabled={isSubmitting}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NonprofitEditDialog;
