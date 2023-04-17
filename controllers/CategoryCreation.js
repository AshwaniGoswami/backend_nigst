const pool = require("../config/pool");
const generateShortId = require("../generator/shortID");







// exports.CategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { course_category, title, description } = req.body;
//     const data = [course_category, title, description];
//     const query1 = "SELECT * FROM course_category WHERE course_category_name = $1";
//     const result = await client.query(query1, [course_category]);

//     if (result.rows.length !== 0) {
//       throw new Error("This category already exists.");
//     } else {
//       const categoryId = generateShortId(5);
//       const query2 = "SELECT * FROM course_category WHERE category_id = $1";
//       let result2 = await client.query(query2, [categoryId]);
//       while (result2.rows.length !== 0) {
//         categoryId = generateShortId(5);
//         result2 = await client.query(query2, [categoryId]);
//       }
//       const query3 =
//         "INSERT INTO course_category (course_category_name, title, description, category_id) VALUES ($1, $2, $3, $4)";
//       await client.query(query3, [...data, categoryId]);
//       res.send({ message: "Category successfully created." });
//       client.release();
//     }
//   } catch (error) {
//     if (error.message === "This category already exists.") {
//       res.status(400).send({ error: error.message });
//     } else {
//       console.log(error);
//       res.status(500).send({ error: "Something went wrong." });
//     }
//   }
// };

// exports.courseCategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { course_category_name, title, description } = req.body;
//     const category_id = generateShortId(5);

//     const query = `
//       INSERT INTO course_category (course_category_name, category_id, title, description)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id, course_category_name, category_id, title, description
//     `;
//     const values = [course_category_name, category_id, title, description];

//     const result = await client.query(query, values);
//     const createdCoursCat = result.rows[0];

//     res.status(201).json({ data: createdCoursCat });

//     client.release();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.courseCategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { course_category_name, title, description } = req.body;

//     const categoryId = generateShortId(5);
//     const courseCategoryId = course_category_name.toUpperCase();
//     const category_id = `${courseCategoryId}-${categoryId}`;

//     const query = `
//       INSERT INTO course_category (course_category_name, category_id, title, description)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id, course_category_name, category_id, title, description
//     `;
//     const values = [course_category_name, category_id, title, description];

//     const result = await client.query(query, values);
//     const createdCoursCat = result.rows[0];

//     res.status(201).json({ data: createdCoursCat });

//     client.release();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };



// exports.courseCategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { course_category_name, description } = req.body;

    

//     const categoryId = generateShortId(2);
//     const courseCategoryId = course_category_name.toUpperCase();
//     const category_id = `${categoryId}-${courseCategoryId}`;

//     const query = `
//       INSERT INTO course_category (course_category_name, category_id, title, description)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id, course_category_name, category_id, title, description
//     `;
//     const values = [course_category_name, category_id, course_category_name, description];

//     const result = await client.query(query, values);
//     const createdCoursCat = result.rows[0];

//     res.status(201).json({ data: createdCoursCat });

//     client.release();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

// exports.courseCategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();
//     const { course_category_name, description } = req.body;

//     const categoryId = generateShortId(2);
//     const courseCategoryId = course_category_name.toUpperCase();
//     const category_id = `${categoryId}-${courseCategoryId}`;

//     const query = `
//       INSERT INTO course_category (course_category_name, category_id, title, description)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (course_category_name) DO 
//         RETURN ERROR('course_category_name already exists');
//       ON CONFLICT (category_id) DO 
//         RETURN ERROR('category_id already exists');
//       RETURNING id, course_category_name, category_id, title, description
//     `;
//     const values = [course_category_name, category_id, course_category_name, description];

//     const result = await client.query(query, values);
//     const createdCoursCat = result.rows[0];

//     res.status(201).json({ data: createdCoursCat });

//     client.release();
//   } catch (err) {
//     console.error(err);
//     if (err.code === '23505' && err.detail.includes('course_category_name')) {
//       res.status(400).json({ error: 'Course category name already exists' });
//     } else if (err.code === '23505' && err.detail.includes('category_id')) {
//       res.status(400).json({ error: 'Category ID already exists' });
//     } else {
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   }

// };


// exports.courseCategoryCreation = async (req, res) => {
//   try {
//     const client = await pool.connect();

//     const { course_category_name, description } = req.body;
//     const title = description;

//     const checkQuery = `
//       SELECT * FROM course_category WHERE course_category_name = $1
//     `;
//     const checkValues = [course_category_name];

//     const checkResult = await client.query(checkQuery, checkValues);
//     if (checkResult.rowCount > 0) {
//       return res.status(409).json({ error: "Course category already exists" });
//     }

//     const categoryId = generateShortId(5);
//     const courseCategoryId = course_category_name.toUpperCase();
//     const category_id = `${courseCategoryId}-${categoryId}`;

//     const query = `
//       INSERT INTO course_category (course_category_name, category_id, title, description)
//       VALUES ($1, $2, $3, $4)
//       RETURNING id, course_category_name, category_id, title, description
//     `;
//     const values = [course_category_name, category_id, title, description];

//     const result = await client.query(query, values);
//     const createdCoursCat = result.rows[0];

//     res.status(201).json({ data: createdCoursCat });

//     client.release();
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }

exports.courseCategoryCreation = async (req, res) => {
  try {
    const client = await pool.connect();

    const { course_category_name, description } = req.body;
    const title = description;

    const checkQuery = `
      SELECT * FROM course_category WHERE course_category_name = $1
    `;
    const checkValues = [course_category_name];

    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rowCount > 0) {
      return res.status(409).json({ error: "Course category already exists" });
    }

    const categoryId = generateShortId(5);
    const courseCategoryId = course_category_name.slice(0, 5).toUpperCase();
    const category_id = `${courseCategoryId}-${categoryId}`;

    const query = `
      INSERT INTO course_category (course_category_name, category_id, title, description)
      VALUES ($1, $2, $3, $4)
      RETURNING id, course_category_name, category_id, title, description
    `;
    const values = [course_category_name, category_id, title, description];

    const result = await client.query(query, values);
    const createdCoursCat = result.rows[0];

    res.status(201).json({ data: createdCoursCat });

    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}



/////////////////////////////////////////update table ////////////////
exports.EditCategory = async (req, res) => {
  try {
    const client = await pool.connect();
    const { course_category, title, description } = req.body;
    const { category_id } = req.params;
    const query1 = "SELECT * FROM course_category WHERE category_id = $1";
    const result = await client.query(query1, [category_id]);
    if (result.rows.length === 0) {
      res.status(400).send({ error: "This category doesn't exist." });
    } else {
      const data = [course_category, title, description, category_id];
      const query2 =
        "UPDATE course_category SET course_category_name = $1, title = $2, description = $3 WHERE category_id = $4";
      await client.query(query2, data);
      res.send({ message: "Category successfully edited." });
      client.release();
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
};
/////////////////////////////////view table//////////////////////////////////////////////
exports.ViewCourseCategory = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = "SELECT * FROM course_category";
    const result = await client.query(query);
    if (result.rows.length === 0) {
      throw new Error("No categories found.");
    } else {
      res.send({ categories: result.rows });
    }
    client.release();
  } catch (error) {
    if (error.message === "No categories found.") {
      res.status(400).send({ error: error.message });
    } else {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  }
};


//////////////////////////////////////////filter category////////////////////////////////////


exports.viewCoursesByCategory = async (req, res) => {
  try {
    const client = await pool.connect();
    const { course_category_name } = req.params;
    const query =
      "SELECT * FROM course_category WHERE  course_category_name = $1 ORDER BY category_id DESC";
    const result = await client.query(query, [course_category_name]);

    if (result.rows.length === 0) {
      throw new Error("No courses found for this category.");
    } else {
      res.send(result.rows);
      client.release();
    }
  } catch (error) {
    if (error.message === "No courses found for this category.") {
      res.status(404).send({ error: error.message });
    } else {
      console.log(error);
      res.status(500).send({ error: "Something went wrong." });
    }
  }
};
///////////////////////////////////// get category name///////////////////////////
exports.getCategoryNames = async (req, res) => {
  try {
    const client = await pool.connect();
    const query = "SELECT course_category_name FROM course_category";
    const result = await client.query(query);
    res.send(result.rows);
    client.release();
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Something went wrong." });
  }
};
