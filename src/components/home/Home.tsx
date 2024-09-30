// <========================= file to create the home page for the user ==============>

// importing the required modules
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "../../store";
import { useNavigate } from "react-router-dom";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ItemTypes = {
  IMAGE: "image",
};

interface ImageFile {
  title: string;
  imageUrl: string;
  _id: string;
  order: number;
}

interface DraggableImageProps {
  id: string;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  file: ImageFile;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  id,
  index,
  moveImage,
  file,
  onDelete,
  onEdit,
}) => {
  const [, ref] = useDrag({
    type: ItemTypes.IMAGE,
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: ItemTypes.IMAGE,
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <li
      ref={(node) => ref(drop(node))}
      className="flex flex-col items-center space-y-2"
    >
      <img
        src={file.imageUrl}
        alt={file.title}
        className="w-32 h-32 object-cover rounded-md"
      />
      <p className="text-lg text-gray-700">{file.title}</p>
      <div className="flex space-x-2">
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={() => onEdit(file._id)}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white p-2 rounded"
          onClick={() => onDelete(file._id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
};

const Home = () => {
  const user = AppState((state) => state.user);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const isAuthorized = AppState((state) => state.isAuthorized);
  const isLoggedOut = AppState((state) => state.isLoggedOut);

  const [files, setFiles] = useState<File[]>([]);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [uploadedFile, setUploadedFile] = useState<ImageFile[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/");
    }
  }, [isAuthorized, navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    const _id = user?._id;
    try {
      const response = await axios.get(`${baseUrl}/user-home/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.status === 202) {
        const imageData = response.data.data.images;
        setUploadedFile(imageData);
        console.log("uploaded data", imageData);
      }
    } catch (error) {
      console.error("error", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.currentTarget.files;

    if (selectedFiles) {
      const newFiles = editMode
        ? [selectedFiles[0]]
        : Array.from(selectedFiles);

      // Validate file types
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const allValid = newFiles.every((file) => validTypes.includes(file.type));

      if (!allValid) {
        alert("Please select valid image files (.jpg, .jpeg, .png).");
        return;
      }

      setFiles(newFiles);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(newPreviews);

      if (!editMode) {
        setImageNames(new Array(newFiles.length).fill(""));
      }
    }
  };

  const handleImageNameChange = (index: number, name: string) => {
    setImageNames((prevNames) => {
      const newNames = [...prevNames];
      newNames[index] = name;
      return newNames;
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (files.length === 0 && !editMode) {
      alert("Please select images to upload.");
      return;
    }

    if (imageNames.some((name) => !name)) {
      alert("Please enter names for all images.");
      return;
    }

    const token = localStorage.getItem("access_token");
    const id = user?._id;

    try {
      const formData = new FormData();

      if (!editMode) {
        files.forEach((file, index) => {
          formData.append("images", file);
          formData.append("imageNames", imageNames[index]);
          formData.append("imageOrders", String(index));
        });

        const response = await axios.patch(
          `${baseUrl}/uploads/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        if (response.status === 201) {
          const imageData = response.data.data.images;
          alert("Images uploaded successfully");
          setUploadedFile(imageData);
        }
      } else if (editingImageId) {
        formData.append("imageNames", imageNames[0]);
        if (files.length > 0) {
          formData.append("images", files[0]);
        }

        const response = await axios.patch(
          `${baseUrl}/image/edit/${id}/${editingImageId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          const imageData = response.data.data.images;
          alert("Image updated successfully");
          setUploadedFile(imageData);
        }
      }

      setFiles([]);
      setImageNames([]);
      setPreviewUrls([]);
      setEditMode(false);
      setEditingImageId(null);
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleDelete = async (_id: string) => {
    const id = user?._id;
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.delete(`${baseUrl}/image/${id}/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      if (response.status === 202) {
        const imageData = response.data.data.images;
        alert("Image deleted successfully");
        setUploadedFile(imageData);
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleEdit = (_id: string) => {
    const imageToEdit = uploadedFile.find((file) => file._id === _id);

    if (imageToEdit) {
      setFiles([]);
      setImageNames([imageToEdit.title]);
      setPreviewUrls([imageToEdit.imageUrl]);
      setEditMode(true);
      setEditingImageId(_id);
    }
  };

  const moveImage = useCallback((dragIndex: number, hoverIndex: number) => {
    setUploadedFile((prevImages) => {
      const newImages = [...prevImages];
      const draggedImage = newImages[dragIndex];
      newImages.splice(dragIndex, 1);
      newImages.splice(hoverIndex, 0, draggedImage);
      return newImages;
    });
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await axios.get(`${baseUrl}/logout`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.status === 202) {
        isLoggedOut();
        localStorage.removeItem("access_token");
        navigate("/");
        alert("User logged out");
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const saveOrder = async () => {
    const token = localStorage.getItem("access_token");
    const id = user?._id;

    try {
      setLoading(true);
      const reorderedIds = uploadedFile.map((file) => file._id);
      const response = await axios.patch(
        `${baseUrl}/image/reorder/${id}`,
        { reorderedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        console.log("Image order updated successfully!");
      } else {
        throw new Error("Failed to update image order");
      }
    } catch (error) {
      console.error("Error updating image order:", error);
    } finally {
      setLoading(false);
      await fetchData();
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="bg-custom w-full flex flex-col justify-center items-center min-h-screen space-y-6 p-4">
        {loading ? ( // Show loading state
          <div>Loading...</div>
        ) : (
          <>
            <div className="bg-white bg-opacity-30 shadow-md rounded-lg p-8 flex flex-col justify-center items-center space-y-4 outline-dotted">
              <h2 className="text-2xl font-semibold text-gray-700">
                Welcome, {user?.username}
              </h2>
              <p className="text-lg text-gray-600">
                {editMode ? "Edit Image" : "Upload Images"}
              </p>
              <input
                type="file"
                accept=".png,.jpeg,.jpg"
                multiple={!editMode}
                onChange={handleFileChange}
              />
              {(previewUrls.length > 0 || editMode) && (
                <div className="grid grid-cols-1 gap-4 mt-4 w-full">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center space-y-2"
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-32 h-32 object-cover rounded-md"
                      />
                      <input
                        type="text"
                        value={imageNames[index] || ""}
                        onChange={(e) =>
                          handleImageNameChange(index, e.target.value)
                        }
                        placeholder="Enter image name"
                        required
                        className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              )}
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out"
                type="button"
                onClick={handleSubmit}
              >
                {editMode ? "Update Image" : "Submit"}
              </button>
            </div>

            <div className="bg-white bg-opacity-30 shadow-md rounded-lg p-8 w-full max-w-lg mt-8">
              <h3 className="text-xl font-semibold mb-4">Uploaded Images:</h3>
              {uploadedFile.length === 0 ? (
                <p>No images uploaded</p>
              ) : (
                <div className="flex flex-row space-x-4 overflow-x-auto p-4">
                  {uploadedFile.map((file, index) => (
                    <DraggableImage
                      key={file.order}
                      id={file._id}
                      index={index}
                      moveImage={moveImage}
                      file={file}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              )}
              <div className="flex justify-center">
                <button
                  className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                    saveOrder()
                  }
                >
                  Save Order
                </button>
              </div>
              <div className="flex justify-center mt-4">
                <button
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DndProvider>
  );
};

export default Home;
