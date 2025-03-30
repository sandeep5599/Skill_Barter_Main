// controllers/submissionController.js
exports.submitAssessment = async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const answersPdf = req.file;
      
      if (!answersPdf) {
        return res.status(400).json({ success: false, message: 'Answers PDF file is required' });
      }
      
      // Check if assessment exists
      const assessment = await Assessment.findById(assessmentId);
      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }
      
      // Check for existing submission
      const existingSubmission = await Submission.findOne({
        assessmentId,
        submittedBy: req.user.id
      });
      
      if (existingSubmission) {
        return res.status(400).json({ success: false, message: 'You have already submitted this assessment' });
      }
      
      // Upload PDF to storage service
      const answersPdfUrl = await uploadService.uploadFile(answersPdf, 'submissions');
      
      // Determine if submission is late
      const isLate = assessment.dueDate && new Date() > new Date(assessment.dueDate);
      
      // Create submission
      const submission = new Submission({
        assessmentId,
        submittedBy: req.user.id,
        answersPdfUrl,
        status: isLate ? 'late' : 'submitted'
      });
      
      await submission.save();
      
      // Notify assessment creator
      if (req.app.get('io')) {
        const io = req.app.get('io');
        const socket = io.sockets.sockets.get(req.socketId);
        
        const user = await User.findById(req.user.id);
        
        if (socket) {
          socket.emit('assessment:submitted', {
            _id: submission._id,
            assessmentId,
            creatorId: assessment.createdBy.toString(),
            submitterName: user.name
          });
        }
      }
      
      res.status(201).json({
        success: true,
        submission
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error submitting assessment',
        error: error.message
      });
    }
  };
  
  // Evaluate a submission
  exports.evaluateSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { marks, feedback } = req.body;
      
      // Validate input
      if (marks === undefined || marks < 0) {
        return res.status(400).json({ success: false, message: 'Valid marks are required' });
      }
      
      // Find submission
      const submission = await Submission.findById(submissionId)
        .populate({
          path: 'assessmentId',
          select: 'title createdBy'
        });
      
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }
      
      // Verify the evaluator is the assessment creator
      if (submission.assessmentId.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to evaluate this submission' });
      }
      
      // Update submission
      submission.marks = marks;
      submission.feedback = feedback;
      submission.status = 'evaluated';
      submission.evaluatedAt = new Date();
      
      await submission.save();
      
      // Notify the learner
      if (req.app.get('io')) {
        const io = req.app.get('io');
        const socket = io.sockets.sockets.get(req.socketId);
        
        if (socket) {
          socket.emit('assessment:evaluated', {
            assessmentId: submission.assessmentId._id,
            submissionId: submission._id,
            learnerId: submission.submittedBy.toString(),
            title: submission.assessmentId.title,
            marks
          });
        }
      }
      
      res.status(200).json({
        success: true,
        submission
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error evaluating submission',
        error: error.message
      });
    }
  };
  
  // Get all submissions for an assessment
  exports.getSubmissionsByAssessment = async (req, res) => {
    try {
      const { assessmentId } = req.params;
      
      // Check if assessment exists and user is the creator
      const assessment = await Assessment.findById(assessmentId);
      
      if (!assessment) {
        return res.status(404).json({ success: false, message: 'Assessment not found' });
      }
      
      if (assessment.createdBy.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Not authorized to view these submissions' });
      }
      
      // Get submissions
      const submissions = await Submission.find({ assessmentId })
        .populate('submittedBy', 'name email')
        .sort({ submittedAt: -1 });
      
      res.status(200).json({
        success: true,
        submissions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching submissions',
        error: error.message
      });
    }
  };
  
  // Get learner's submissions
  exports.getLearnerSubmissions = async (req, res) => {
    try {
      const submissions = await Submission.find({ submittedBy: req.user.id })
        .populate({
          path: 'assessmentId',
          select: 'title createdBy skillId',
          populate: [
            { path: 'createdBy', select: 'name' },
            { path: 'skillId', select: 'name' }
          ]
        })
        .sort({ submittedAt: -1 });
      
      res.status(200).json({
        success: true,
        submissions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching learner submissions',
        error: error.message
      });
    }
  };