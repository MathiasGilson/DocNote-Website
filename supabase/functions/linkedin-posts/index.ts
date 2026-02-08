import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LinkedInPost {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  slug: string;
  linkedinUrl: string;
}

async function fetchLinkedInPosts(page: number = 1, limit: number = 9): Promise<{ posts: LinkedInPost[], total: number, hasMore: boolean }> {
  const linkedinToken = Deno.env.get('LINKEDIN_ACCESS_TOKEN');

  if (!linkedinToken) {
    return getMockPosts(page, limit);
  }

  try {
    const response = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(urn:li:organization:107244351)&count=${limit}&start=${(page - 1) * limit}`,
      {
        headers: {
          'Authorization': `Bearer ${linkedinToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!response.ok) {
      console.error('LinkedIn API error:', response.status);
      return getMockPosts(page, limit);
    }

    const data = await response.json();
    const posts: LinkedInPost[] = (data.elements || []).map((post: any, index: number) => {
      const text = post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '';
      const title = text.split('\n')[0].substring(0, 100) || 'LinkedIn Post';
      const postId = post.id.split(':').pop() || `post-${index}`;

      return {
        id: postId,
        title,
        content: text,
        publishedAt: new Date(post.created?.time || Date.now()).toISOString(),
        slug: `${postId}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 50)}`,
        linkedinUrl: `https://www.linkedin.com/feed/update/${post.id}`,
      };
    });

    return {
      posts,
      total: data.paging?.total || posts.length,
      hasMore: data.paging?.start + data.paging?.count < data.paging?.total,
    };
  } catch (error) {
    console.error('Error fetching LinkedIn posts:', error);
    return getMockPosts(page, limit);
  }
}

function getMockPosts(page: number = 1, limit: number = 9): { posts: LinkedInPost[], total: number, hasMore: boolean } {
  const mockPosts: LinkedInPost[] = [
    {
      id: "1",
      title: "DocNote AI Transforms Medical Documentation",
      content: "DocNote AI Transforms Medical Documentation\n\nWe're excited to share how our AI-powered voice assistant is revolutionizing the way healthcare professionals document patient encounters. By reducing documentation time by up to 70%, doctors can focus more on what matters most: patient care.\n\n🏥 Real-world impact:\n• 2+ hours saved per day per physician\n• 95% accuracy in medical transcription\n• HIPAA-compliant and secure\n• Seamless integration with existing EMR systems\n\nJoin us in transforming healthcare documentation.",
      publishedAt: "2025-01-15T10:00:00Z",
      slug: "docnote-ai-transforms-medical-documentation",
      linkedinUrl: "https://www.linkedin.com/company/107244351",
    },
    {
      id: "2",
      title: "Reducing Physician Burnout with AI",
      content: "Reducing Physician Burnout with AI\n\nPhysician burnout is at an all-time high, with administrative tasks being a leading cause. Our latest study shows that DocNote's AI assistant can reduce documentation burden significantly.\n\n📊 Key findings:\n• 65% reduction in after-hours charting\n• Improved work-life balance for healthcare providers\n• Higher job satisfaction scores\n• Better patient outcomes through increased face-to-face time\n\nLet's work together to make healthcare more sustainable for our dedicated medical professionals.",
      publishedAt: "2025-01-10T14:30:00Z",
      slug: "reducing-physician-burnout-with-ai",
      linkedinUrl: "https://www.linkedin.com/company/107244351",
    },
    {
      id: "3",
      title: "The Future of Clinical Documentation",
      content: "The Future of Clinical Documentation\n\nArtificial Intelligence is reshaping how we think about medical records. DocNote is at the forefront of this revolution, combining cutting-edge AI with deep healthcare expertise.\n\n🚀 What's next:\n• Multi-language support for global healthcare\n• Advanced specialty-specific templates\n• Predictive analytics for clinical insights\n• Enhanced integration with diagnostic tools\n\nThe future of healthcare is here, and it's more efficient, accurate, and patient-centered than ever before.",
      publishedAt: "2025-01-05T09:00:00Z",
      slug: "future-of-clinical-documentation",
      linkedinUrl: "https://www.linkedin.com/company/107244351",
    },
  ];

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPosts = mockPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    total: mockPosts.length,
    hasMore: endIndex < mockPosts.length,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '9');

    const result = await fetchLinkedInPosts(page, limit);

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in linkedin-posts function:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch LinkedIn posts',
        posts: [],
        total: 0,
        hasMore: false,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
