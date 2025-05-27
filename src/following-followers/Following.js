import React, { useState, useEffect } from "react";
import axios from "axios"
import {jwtDecode} from "jwt-decode";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Following.module.css";
import BASE_URL from '../config.js';

function UsersFollowing() {
  const navigate = useNavigate();
  
  // Get the token from sessionStorage and decode it.
  const token = sessionStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const userId = decoded ? decoded.id : null;

  // Initialize state as an object with default values.
  const [followingData, setFollowingData] = useState({
    following: [], // expecting an array of follow objects.
    message: "",   // some message from your API.
  });

  // Initialize state for the username input (for the "unfollow" functionality).
  const [username, setUsername] = useState("");

  useEffect(() => {

    // Makes sure that if there is no token you are re-routed back to the homepage
    if(token == null){
      alert("Please Login")
      navigate("/")
      return; // Stops further execution
    }
    
    async function fetchUserFollowing() {
      if (userId && token) {
        try {
          const response = await axios.post(
            `${BASE_URL}/follow/${userId}/following`,
            { token }
          );
          setFollowingData(response.data);
        } catch (error) {
          console.error("Error fetching following list:", error);
        }
      } else {
        console.warn("Missing userId or token, skipping API call");
      }
    }
    fetchUserFollowing();
  }, [userId, token]);

  // Updates state as the user types in the input.
  const handleChange = (event) => {
    setUsername(event.target.value);
  };

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("Unfollowed username:", username);
    console.log("User Id:", userId);
  
    try {
      const response = await axios.delete(`${BASE_URL}/follow/${userId}/unfollow`, {
        headers: { "Content-Type": "application/json" }, // Ensure JSON format
        data: { username, userId }, // Correctly pass username inside "data"
      });
  
      alert(response.data.message)
      navigate('/users')
    } catch (error) {
      console.error("Error unfollowing user:", error.response ? error.response.data : error.message);
    }
  }

  const handleClick = () => {
    navigate('/users')
  }

  // Safely extract the list of following and map over it.
  // Use optional chaining and a fallback to an empty array.
  const followingList = followingData?.following || [];
  const mappedUsernames = followingList.map((user) => user.username);
  const listItems = mappedUsernames.map((name, index) => (
    <li key={index}>{name}</li>
  ));

 return (
    <div className={styles.followingPage}>
      {/* Navigation Section */}
      <section className={styles.navSection}>
        <h1>Kingdom Communit-E</h1>
        <button onClick={handleClick}>Back</button>
      </section>

      {/* Following List Section */}
      <section className={styles.listSection}>
        <h3>{followingData.message}</h3>
        <ul>{listItems}</ul>
      </section>

      {/* Unfollow Form Section */}
      <section className={styles.formSection}>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              <h3>Unfollow User</h3>
              <input
                type="text"
                name="username"
                value={username}
                onChange={handleChange}
                placeholder="Enter username"
              />
            </label>
            <button type="submit">Unfollow User</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default UsersFollowing;