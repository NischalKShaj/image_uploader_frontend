// <========================= file to create the home page for the user ==============>

// importing the required modules
import axios from "axios";
import { useEffect, useState } from "react";
import { AppState } from "../../store";

const Home = () => {
  const user = AppState((state) => state.user);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [file, setFile] = useState<File | null>(null);
  const [imageName, setImageName] = useState("");
  const [uploadedFile, setUploadedFile] = useState<
    { name: string; url: string }[]
  >([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
        setUploadedFile(response.data.data.images);
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

    if (!file || !imageName) {
      alert("select an image or add the image name");
      return;
    }

    const token = localStorage.getItem("access_token");
    const id = user?._id;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("imageName", imageName);

    try {
      const response = await axios.post(`${baseUrl}/uploads/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      if (response.status === 201) {
        console.log("image added successfully");
        alert("image uploaded successfully");
        setUploadedFile((prevData) => [
          ...prevData,
          {
            name: response.data.data.image.name,
            url: response.data.data.image.url,
          },
        ]);
        setFile(null);
        setImageName("");
      }
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <div className="bg-custom w-full flex justify-center items-center min-h-screen">
      <div className="flex flex-col justify-center items-center outline-dotted">
        <h6>welcome {user?.username}</h6>
        <p>Upload your Image here</p>
        <input
          type="text"
          name="image_name"
          id="image_name"
          value={imageName}
          onChange={handleImageNameChange}
          placeholder="Enter image name"
          required
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
            className="w-32 h-32 object-cover mt-4"
          />
        )}
        <button
          className="bg-blue-500 text-white"
          type="button"
          onClick={handleSubmit}
        >
          submit
        </button>
      </div>
      <div className="mt-8">
        <h3>Uploaded Images:</h3>
        {uploadedFile.length === 0 ? (
          <p>No images uploaded</p>
        ) : (
          <ul>
            {uploadedFile.map((file, index) => (
              <li key={index}>
                <p className="text-lg p-2 ">{file.name}</p>
                <img
                  src={`${baseUrl}/image/${file.url}`}
                  alt={file.name}
                  className="w-32 h-32 object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Home;
