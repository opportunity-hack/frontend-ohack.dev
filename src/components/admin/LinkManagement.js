// LinkManagement.js
import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const LINK_COLOR_OPTIONS = [
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "success", label: "Success" },
  { value: "error", label: "Error" },
  { value: "info", label: "Info" },
  { value: "warning", label: "Warning" },
];

const LINK_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const LINK_VARIANT_OPTIONS = [
  { value: "text", label: "Text" },
  { value: "contained", label: "Contained" },
  { value: "outlined", label: "Outlined" },
];

const DEFAULT_LINK = {
  name: "",
  link: "",
  color: "primary",
  size: "medium",
  variant: "text",
  open_new: "False",
};

const LinkManagement = ({ links = [], onChange }) => {
  const handleAddLink = () => {
    onChange([...links, { ...DEFAULT_LINK }]);
  };

  const handleUpdateLink = (index, field, value) => {
    const newLinks = [...links];
    newLinks[index] = {
      ...newLinks[index],
      [field]: value,
    };
    onChange(newLinks);
  };

  const handleRemoveLink = (index) => {
    onChange(links.filter((_, i) => i !== index));
  };

  // Handle drag-and-drop reordering
  const handleDragEnd = (result) => {
    // Drop outside the list
    if (!result.destination) {
      return;
    }

    // No change in position
    if (result.destination.index === result.source.index) {
      return;
    }

    // Create a copy of links array
    const reorderedLinks = Array.from(links);

    // Remove the dragged item from its position
    const [removed] = reorderedLinks.splice(result.source.index, 1);

    // Insert the dragged item at the destination position
    reorderedLinks.splice(result.destination.index, 0, removed);

    // Update the links with the new order
    onChange(reorderedLinks);
  };

  const validateUrl = (url) => {
    // Handle empty URLs
    if (!url) return false;

    // Trim whitespace
    url = url.trim();

    // Internal/relative URL patterns
    const isRelativeUrl = /^\/[^\/].*$/; // Starts with single / followed by non-slash
    const isAnchorLink = /^#[A-Za-z0-9-_]+$/; // Anchor links like #section-1
    const isQueryParam = /^\/?\?[A-Za-z0-9-_=&]+$/; // Query parameters like ?param=value

    // Check for relative URLs, anchor links, or query parameters
    if (
      isRelativeUrl.test(url) ||
      isAnchorLink.test(url) ||
      isQueryParam.test(url)
    ) {
      return true;
    }

    // For absolute URLs, use URL constructor
    try {
      new URL(url);
      return true;
    } catch {
      // If URL constructor fails, check if adding https:// makes it valid
      try {
        new URL(`https://${url}`);
        return true; // Valid domain without protocol
      } catch {
        return false;
      }
    }
  };

  return (
    <Box>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="links">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef}>
              {links.map((link, index) => (
                <Draggable
                  key={`link-${index}`}
                  draggableId={`link-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <ListItem
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        flexDirection: "column",
                        alignItems: "stretch",
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        mb: 2,
                        p: 2,
                        backgroundColor: snapshot.isDragging
                          ? "#f5f5f5"
                          : "inherit",
                        boxShadow: snapshot.isDragging
                          ? "0 0 10px rgba(0,0,0,0.2)"
                          : "none",
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                        mb={1}
                      >
                        <Box display="flex" alignItems="center">
                          <div
                            {...provided.dragHandleProps}
                            style={{ cursor: "grab", marginRight: "8px" }}
                          >
                            <DragIcon color="action" />
                          </div>
                          <Typography variant="subtitle1" fontWeight="bold">
                            Link {index + 1}
                          </Typography>
                        </Box>
                        <IconButton
                          edge="end"
                          onClick={() => handleRemoveLink(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <TextField
                        label="Name"
                        value={link.name}
                        onChange={(e) =>
                          handleUpdateLink(index, "name", e.target.value)
                        }
                        fullWidth
                        margin="normal"
                        required
                      />

                      <TextField
                        label="URL"
                        value={link.link}
                        onChange={(e) =>
                          handleUpdateLink(index, "link", e.target.value)
                        }
                        fullWidth
                        margin="normal"
                        required
                        error={link.link !== "" && !validateUrl(link.link)}
                        helperText={
                          link.link !== "" && !validateUrl(link.link)
                            ? "Please enter a valid URL"
                            : ""
                        }
                      />

                      <Box display="flex" gap={2} mt={2}>
                        <FormControl fullWidth>
                          <InputLabel>Color</InputLabel>
                          <Select
                            value={link.color || "primary"}
                            label="Color"
                            onChange={(e) =>
                              handleUpdateLink(index, "color", e.target.value)
                            }
                          >
                            {LINK_COLOR_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Size</InputLabel>
                          <Select
                            value={link.size || "medium"}
                            label="Size"
                            onChange={(e) =>
                              handleUpdateLink(index, "size", e.target.value)
                            }
                          >
                            {LINK_SIZE_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <FormControl fullWidth>
                          <InputLabel>Variant</InputLabel>
                          <Select
                            value={link.variant || "text"}
                            label="Variant"
                            onChange={(e) =>
                              handleUpdateLink(index, "variant", e.target.value)
                            }
                          >
                            {LINK_VARIANT_OPTIONS.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <FormControlLabel
                        control={
                          <Switch
                            checked={link.open_new === "True"}
                            onChange={(e) =>
                              handleUpdateLink(
                                index,
                                "open_new",
                                e.target.checked ? "True" : "False"
                              )
                            }
                          />
                        }
                        label="Open in new tab"
                        sx={{ mt: 1 }}
                      />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      <Button
        onClick={handleAddLink}
        startIcon={<AddIcon />}
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
      >
        Add Link
      </Button>
    </Box>
  );
};

export default LinkManagement;
