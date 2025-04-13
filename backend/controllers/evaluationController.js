const Assessment = require('../models/Assessment');
const Submission = require('../models/Submission');
const Points = require('../models/Points');
const User = require('../models/User');

exports.evaluateSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { scores, feedback, overallFeedback, totalScore, averageScore } = req.body;
    const evaluatorId = req.user.id;
    
    // Validate incoming data
    if (!scores || !Array.isArray(scores) || scores.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scores format. Expected array of 5 scores.'
      });
    }
    
    // Find the submission
    const submission = await Submission.findById(submissionId);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    // Update submission with evaluation data
    submission.evaluation = {
      scores,
      feedback,
      overallFeedback,
      totalScore,
      averageScore,
      evaluatedAt: new Date(),
      evaluatedBy: evaluatorId
    };
    
    submission.status = 'evaluated';
    
    await submission.save();
    
    // Add points to the user based on the average score
    const userId = submission.userId;
    let userPoints = await Points.findOne({ userId });

    console.log('User Points:', userPoints);
    
    if (!userPoints) {
      userPoints = new Points({ userId });
    }
    
    // Add the average score to the user's points
    userPoints.points += averageScore;

    console.log('Updated User Points:', userPoints.points);
    
    // Add to point history
    userPoints.pointHistory.push({
      points: averageScore,
      reason: 'Assessment Score',
      assessmentId: submission.assessmentId,
      date: new Date()
    });
    
    await userPoints.save();
    
    // Update assessment if needed
    const assessment = await Assessment.findById(submission.assessmentId);
    if (assessment) {
      // Update average score and submission count for statistics
      const allSubmissions = await Submission.find({ 
        assessmentId: assessment._id,
        status: 'evaluated'
      });
      
      const totalSubmissions = allSubmissions.length;
      const totalScores = allSubmissions.reduce((sum, s) => {
        return sum + (s.evaluation ? s.evaluation.totalScore : 0);
      }, 0);
      
      assessment.stats = {
        totalSubmissions,
        averageScore: totalSubmissions > 0 ? totalScores / totalSubmissions / 5 : 0
      };
      
      await assessment.save();
    }
    
    res.json({
      success: true,
      message: 'Submission evaluated successfully',
      submission: {
        _id: submission._id,
        status: submission.status,
        evaluation: submission.evaluation
      }
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    
    const submission = await Submission.findById(submissionId)
      .populate('userId', 'name email avatar')
      .populate('assessmentId', 'title description questionsPdfUrl skillId');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }
    
    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};