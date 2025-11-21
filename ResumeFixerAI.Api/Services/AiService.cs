using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using ResumeFixerAI.Api.Models;
using System.Threading.Tasks;
using System.Net.Http;
namespace ResumeFixerAI.Api.Services;

public interface IAiService
{
    Task<ResumeResponse> RewriteAsync(ResumeRequest request);
}

public class AiService : IAiService
    {
        private readonly IHttpClientFactory _http;
        private readonly OpenAiOptions _opts;

        public AiService(IHttpClientFactory http, IOptions<OpenAiOptions> opts)
        {
            _http = http;
            _opts = opts.Value;
        }

        public async Task<ResumeResponse> RewriteAsync(ResumeRequest request)
        {
            var client = _http.CreateClient();
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _opts.ApiKey);

            var payload = new
            {
                model = _opts.Model,
                input = new[]
                {
                    new {
                        role = "user",
                        content = $"Rewrite this resume in ATS-friendly markdown:\n\n{request.Text}"
                    }
                }
            };

            var json = JsonConvert.SerializeObject(payload);
            var resp = await client.PostAsync(
                "https://api.openai.com/v1/responses",
                new StringContent(json, Encoding.UTF8, "application/json")
            );

            var body = await resp.Content.ReadAsStringAsync();

            dynamic obj = JsonConvert.DeserializeObject(body);

            // Extract correct path for /v1/responses
            string md = obj.output[0].content[0].text.ToString();
            string html = "<pre>" + System.Net.WebUtility.HtmlEncode(md) + "</pre>";

            return new ResumeResponse
            {
                Improved = md,
                Html = html
            };
        }
}
