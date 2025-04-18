
interface AnalysisPart {
  text: string
}

interface AnalysisResponse {
  extractedText: string
  analysis?: {
    score?: number
    summary?: string
    improvements?: string[]
    keywords?: {
      skills?: string[]
      technologies?: string[]
      job_related?: string[]
    }
    parts?: AnalysisPart[]
  }
  message?: string
}
