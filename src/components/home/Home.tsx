// <========================= file to create the home page for the user ==============>

// importing the required modules
import axios from "axios";
import { useEffect, useState } from "react";
import { AppState } from "../../store";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const user = AppState((state) => state.user);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const navigate = useNavigate();
  const isAuthorized = AppState((state) => state.isAuthorized);
  const isLoggedOut = AppState((state) => state.isLoggedOut);
  const [file, setFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<
    { title: string; imageUrl: string; _id: string }[]
  >([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editingImageId, setEditingImageId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/");
    }
  }, [isAuthorized, navigate]);

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    console.log(baseUrl);
    console.log("token", token);
    const _id = user?._id;
    try {
      const response = await axios.get(`${baseUrl}/user-home/${_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.status === 202) {
        console.log(response.data);
        const imageData = response.data.data.images;
        console.log("img", imageData);
        setUploadedFile(imageData);
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?._id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.currentTarget.files?.[0];

    if (target) {
      setFile(target);
      setPreviewUrl(URL.createObjectURL(target));
    }
  };

  const handleImageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageName(e.target.value);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!file && !editMode) {
      alert("Please select an image to upload.");
      return;
    }

    if (!imageName) {
      alert("Please enter an image name.");
      return;
    }

    const token = localStorage.getItem("access_token");
    const id = user?._id;

    const formData = new FormData();
    if (file) {
      formData.append("image", file);
    }
    formData.append("imageName", imageName);

    try {
      if (editMode && editingImageId) {
        // Update existing image
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
      } else {
        // Add a new image
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
          alert("Image uploaded successfully");
          setUploadedFile(imageData);
        }
      }

      // Clear input fields after upload/edit
      setFile(null);
      setImageName("");
      setPreviewUrl(null);
      setEditMode(false);
      setEditingImageId(null);

      const fileInput = document.querySelector(
        'input[type="file"]'
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = ""; // Clear file input
      }
    } catch (error) {
      console.error("error", error);
    }
  };

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
        alert("image deleted successfully");
        setUploadedFile(imageData);
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  const handleEdit = (_id: string) => {
    // Find the image being edited
    const imageToEdit = uploadedFile.find((file) => file._id === _id);

    if (imageToEdit) {
      setImageName(imageToEdit.title); // Set image name in input field
      setPreviewUrl(imageToEdit.imageUrl); // Set preview image
      setEditMode(true); // Set to edit mode
      setEditingImageId(_id); // Set the ID of the image being edited
    }
  };

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
        alert("user logged out");
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <div className="bg-custom w-full flex flex-col justify-center items-center min-h-screen space-y-6 p-4">
      <div className="bg-white shadow-md rounded-lg p-8 flex flex-col justify-center items-center space-y-4 outline-dotted">
        <h2 className="text-2xl font-semibold text-gray-700">
          Welcome, {user?.username}
        </h2>
        <p className="text-lg text-gray-600">
          {editMode ? "Edit Image" : "Upload Image"}
        </p>
        <input
          type="text"
          name="image_name"
          id="image_name"
          value={imageName}
          onChange={handleImageNameChange}
          placeholder="Enter image name"
          required
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="file"
          accept=".png,.jpeg,.jpg"
          onChange={handleFileChange}
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Image Preview"
            className="w-96 h-96 object-cover mt-4 rounded-lg shadow-lg"
          />
        )}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out"
          type="button"
          onClick={handleSubmit}
        >
          {editMode ? "Update Image" : "Submit"}
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-lg mt-8">
        <h3 className="text-xl font-semibold mb-4">Uploaded Images:</h3>
        {uploadedFile.length === 0 ? (
          <p>No images uploaded</p>
        ) : (
          <ul className="flex space-x-8 overflow-x-auto">
            {uploadedFile.map((file, index) => (
              <li key={index} className="flex flex-col items-center space-y-2">
                <div className="text-center">
                  <p className="text-lg text-gray-700">{file.title}</p>
                  <img
                    src={file.imageUrl}
                    alt={file.title}
                    className="w-40 h-40 object-cover rounded-md shadow-md"
                  />
                  <div className="flex flex-col space-y-2 mt-2">
                    <button
                      className="bg-green-500 rounded-md"
                      onClick={() => handleEdit(file._id)}
                    >
                      edit
                    </button>
                    <button
                      className="bg-red-500 rounded-md"
                      onClick={() => handleDelete(file._id)}
                    >
                      delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition duration-300 ease-in-out"
        type="button"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
